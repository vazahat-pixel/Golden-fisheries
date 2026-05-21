import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../../store/adminStore';
import { masterService } from '../../../services/masterService';
import { buildHarvestCreatePayload } from '../../../utils/harvestPayload';
import { ArrowLeft, Printer, Download, Edit3, CheckCircle, Share2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const HarvestSlipPreview = () => {
  const navigate = useNavigate();
  const { addHarvestSlip } = useAdminStore();
  const [slip, setSlip] = useState(null);
  const printAreaRef = useRef(null);

  useEffect(() => {
    const rawData = sessionStorage.getItem('current_harvest_slip_creation');
    if (rawData) {
      try {
        setSlip(JSON.parse(rawData));
      } catch (err) {
        toast.error('Failed to parse slip data');
      }
    } else {
      toast.error('No slip data found in current session');
      navigate('/admin/procurement/harvest/new');
    }
  }, [navigate]);

  if (!slip) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-olive"></div>
      </div>
    );
  }

  // Pad the items list with empty rows up to 10 rows to match the paper slip pad appearance
  const displayItems = [...slip.items];
  const minRows = 10;
  while (displayItems.length < minRows) {
    displayItems.push({
      id: `empty-${displayItems.length}`,
      hsnCode: '',
      particulars: '',
      count: '',
      noOfBoxes: '',
      boxWeight: '',
      totalWeight: ''
    });
  }

  const handleConfirm = async () => {
    try {
      const [fRes, pRes] = await Promise.all([
        masterService.farmers.getAll({ limit: 200 }),
        masterService.products.getAll({ limit: 200 }),
      ]);
      const farmers = fRes?.data || fRes?.docs || (Array.isArray(fRes) ? fRes : []);
      const products = pRes?.data || pRes?.docs || (Array.isArray(pRes) ? pRes : []);
      const payload = buildHarvestCreatePayload(slip, { farmers, products });
      await addHarvestSlip(payload);
      sessionStorage.removeItem('current_harvest_slip_creation');
      toast.success('Harvest slip saved');
      const back =
        window.location.pathname.startsWith('/mobile') ? '/mobile/procurement/harvest' : '/admin/procurement/harvest';
      navigate(back);
    } catch (err) {
      toast.error(err?.message || 'Failed to save harvest slip');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const element = printAreaRef.current;
    if (!element) return;

    const loadToast = toast.loading('Generating PDF...');

    try {
      // Capture element with html2canvas using a higher scale for high resolution print quality
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFFFF',
      });
      const imgData = canvas.toDataURL('image/png');

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10; // Margin from top

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`HarvestSlip_${slip.tpNo || 'Draft'}.pdf`);
      toast.success('PDF downloaded successfully!', { id: loadToast });
    } catch (error) {
      console.error('Error generating PDF', error);
      toast.error('Error generating PDF', { id: loadToast });
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500 font-sans print:p-0 print:m-0">
      {/* Action Buttons - Hidden in Print */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-card-border pb-5 print:hidden">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/admin/procurement/harvest/new')} 
            className="text-text-muted hover:text-[#6A7051] transition-all p-1"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold tracking-wider text-brand-olive uppercase">
              Harvest Slip Preview
            </h1>
            <p className="text-text-secondary text-sm mt-1">Review the paper slip replica before saving and printing.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={() => navigate('/admin/procurement/harvest/new')}
            className="flex-1 sm:flex-none border border-card-border bg-white text-text-secondary px-4 py-2.5 text-xs font-black uppercase tracking-wider hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <Edit3 size={14} /> Edit
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-none border border-card-border bg-white text-text-secondary px-4 py-2.5 text-xs font-black uppercase tracking-wider hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <Printer size={14} /> Print
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex-1 sm:flex-none border border-card-border bg-white text-text-secondary px-4 py-2.5 text-xs font-black uppercase tracking-wider hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <Download size={14} /> Download PDF
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 sm:flex-none bg-[#6A7051] text-white px-5 py-2.5 text-xs font-black uppercase tracking-wider hover:bg-[#5F6846] transition-all flex items-center justify-center gap-2 shadow-md"
          >
            <CheckCircle size={14} /> Confirm & Save
          </button>
        </div>
      </div>

      {/* Outer Paper Sheet Container */}
      <div className="flex justify-center items-center py-4 bg-slate-100/50 print:bg-transparent print:p-0">
        <div 
          ref={printAreaRef}
          className="w-[210mm] min-h-[297mm] bg-white p-[15mm] border border-slate-300 shadow-xl print:shadow-none print:border-none print:p-[5mm] print:w-full"
        >
          {/* Double Blue Borders */}
          <div className="border-[3px] border-double border-[#1A365D] p-3 h-full flex flex-col justify-between">
            <div>
              {/* Header Box */}
              <div className="text-center pb-2 border-b border-[#1A365D]">
                <h1 className="text-3xl font-black tracking-widest text-[#1A365D] font-serif leading-none">
                  M. K. FISHERIES
                </h1>
                <h2 className="text-xs font-black tracking-widest text-[#1A365D] uppercase mt-1">
                  WHOLE SALE FISH MERCHANTS
                </h2>
                <p className="text-[10px] font-bold text-[#1A365D] tracking-wider mt-0.5">
                  KARWAR & MANGALORE (KARNATAKA)
                </p>
                <p className="text-[9px] font-bold text-[#1A365D] mt-0.5">
                  Mob : 9019411439, 9663655558
                </p>
                <div className="border-t border-[#1A365D] mt-1.5 pt-1">
                  <span className="text-base font-black tracking-widest text-[#1A365D] border-b border-[#1A365D] px-4 py-0.5 inline-block">
                    TAPAL
                  </span>
                </div>
              </div>

              {/* Details Section */}
              <div className="grid grid-cols-12 border-b border-[#1A365D] text-xs">
                {/* Farmer Details */}
                <div className="col-span-7 border-r border-[#1A365D] p-2 flex flex-col justify-between min-h-[90px]">
                  <div>
                    <span className="font-extrabold text-[#1A365D] block uppercase tracking-wider text-[10px]">
                      Customer Details :
                    </span>
                    <span className="font-black text-[#1A365D] mt-1 block uppercase text-sm">
                      {slip.farmerName || '__________________________________'}
                    </span>
                  </div>
                  <div className="text-[9px] text-slate-400">
                    GOLDEN FISHERIES ERP REGISTERED CUSTOMER/FARMER
                  </div>
                </div>

                {/* Meta Details */}
                <div className="col-span-5 text-[10px]">
                  <div className="grid grid-cols-12 border-b border-[#1A365D]">
                    <div className="col-span-5 font-black uppercase text-[#1A365D] px-2 py-1.5 border-r border-[#1A365D]">
                      TP NO
                    </div>
                    <div className="col-span-7 font-black text-[#1A365D] px-2 py-1.5 uppercase bg-slate-50/50">
                      {slip.tpNo || '___________'}
                    </div>
                  </div>
                  <div className="grid grid-cols-12 border-b border-[#1A365D]">
                    <div className="col-span-5 font-black uppercase text-[#1A365D] px-2 py-1.5 border-r border-[#1A365D]">
                      Date :
                    </div>
                    <div className="col-span-7 font-bold text-[#1A365D] px-2 py-1.5">
                      {slip.date ? new Date(slip.date).toLocaleDateString('en-GB') : '___________'}
                    </div>
                  </div>
                  <div className="grid grid-cols-12 border-b border-[#1A365D]">
                    <div className="col-span-5 font-black uppercase text-[#1A365D] px-2 py-1.5 border-r border-[#1A365D]">
                      Vehicle No:
                    </div>
                    <div className="col-span-7 font-bold text-[#1A365D] px-2 py-1.5 uppercase">
                      {slip.vehicleNo || '___________'}
                    </div>
                  </div>
                  <div className="grid grid-cols-12 border-b border-[#1A365D]">
                    <div className="col-span-5 font-black uppercase text-[#1A365D] px-2 py-1.5 border-r border-[#1A365D]">
                      Driver Name:
                    </div>
                    <div className="col-span-7 font-bold text-[#1A365D] px-2 py-1.5 uppercase">
                      {slip.driverName || '___________'}
                    </div>
                  </div>
                  <div className="grid grid-cols-12">
                    <div className="col-span-5 font-black uppercase text-[#1A365D] px-2 py-1.5 border-r border-[#1A365D]">
                      Grader Name:
                    </div>
                    <div className="col-span-7 font-bold text-[#1A365D] px-2 py-1.5 uppercase">
                      {slip.graderName || '___________'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Table Data */}
              <div className="w-full">
                <table className="w-full text-center border-collapse text-[10px]">
                  <thead>
                    <tr className="border-b border-[#1A365D] font-black text-[#1A365D]">
                      <th className="py-2 px-1 border-r border-[#1A365D] w-10">Sl No</th>
                      <th className="py-2 px-1 border-r border-[#1A365D] w-24">Hsn Code</th>
                      <th className="py-2 px-1 border-r border-[#1A365D] w-48 text-left pl-3">Particulars</th>
                      <th className="py-2 px-1 border-r border-[#1A365D] w-16">Count</th>
                      <th className="py-2 px-1 border-r border-[#1A365D] w-20">NO OF BOXES</th>
                      <th className="py-2 px-1 border-r border-[#1A365D] w-20">Box Weight</th>
                      <th className="py-2 px-1 w-24 text-right pr-3">Total Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayItems.map((item, index) => {
                      const isReal = item.particulars || item.hsnCode;
                      return (
                        <tr 
                          key={item.id} 
                          className="border-b border-[#1A365D] h-[26px]"
                        >
                          <td className="border-r border-[#1A365D] font-bold text-slate-700">
                            {index + 1}
                          </td>
                          <td className="border-r border-[#1A365D] font-bold text-slate-800 tracking-wider">
                            {item.hsnCode || ''}
                          </td>
                          <td className="border-r border-[#1A365D] text-left pl-3 font-extrabold text-[#1A365D]">
                            {item.particulars || ''}
                          </td>
                          <td className="border-r border-[#1A365D] font-bold text-slate-800">
                            {item.count || ''}
                          </td>
                          <td className="border-r border-[#1A365D] font-extrabold text-slate-800">
                            {item.noOfBoxes || ''}
                          </td>
                          <td className="border-r border-[#1A365D] font-bold text-slate-800">
                            {item.boxWeight ? `${item.boxWeight} kg` : ''}
                          </td>
                          <td className="text-right pr-3 font-black text-[#1A365D]">
                            {item.totalWeight ? `${parseFloat(item.totalWeight).toFixed(2)}` : ''}
                          </td>
                        </tr>
                      );
                    })}

                    {/* Totals Row */}
                    <tr className="border-b border-[#1A365D] font-black text-[#1A365D] h-[30px] bg-slate-50/20">
                      <td colSpan="3" className="py-2 border-r border-[#1A365D] text-center uppercase tracking-widest text-xs">
                        TOTAL
                      </td>
                      <td className="border-r border-[#1A365D]"></td>
                      <td className="border-r border-[#1A365D] text-base">{slip.totalBoxes || 0}</td>
                      <td className="border-r border-[#1A365D]"></td>
                      <td className="text-right pr-3 text-base">{slip.totalWeight ? parseFloat(slip.totalWeight).toFixed(2) : '0.00'}</td>
                    </tr>

                    {/* Bottom notes row 1 */}
                    <tr className="border-b border-[#1A365D] h-[34px]">
                      <td colSpan="5" className="py-1 px-3 border-r border-[#1A365D] text-left font-black uppercase text-[#6B5A3E] bg-[#FAF8F5]">
                        NOTES ( BLACK GILL SECOND QUALITY ) ( EXP )
                      </td>
                      <td colSpan="2" className="text-left px-3 text-[9px] font-bold text-[#1A365D] uppercase bg-[#FAF8F5]">
                        {slip.notes || 'N/A'}
                      </td>
                    </tr>

                    {/* Bottom notes row 2 */}
                    <tr className="border-b border-[#1A365D] h-[34px]">
                      <td colSpan="5" className="py-1 px-3 border-r border-[#1A365D] text-left font-black uppercase text-[#6B5A3E]">
                        THIRD QUALITY DAMAGE MATERIALS & DIO COMPLAINT
                      </td>
                      <td colSpan="2" className="text-left px-3 text-[9px] font-bold text-[#1A365D] uppercase">
                        {slip.damageNotes || 'N/A'}
                      </td>
                    </tr>

                    {/* Bottom rent note row */}
                    <tr className="border-b border-[#1A365D] h-[34px]">
                      <td colSpan="5" className="py-1.5 px-3 border-r border-[#1A365D] text-left font-extrabold text-red-600 uppercase tracking-wide bg-red-50/20">
                        {slip.iceRentDeducted ? 'ICE & VEHICLE RENT DEDUCTED' : 'ICE & VEHICLE RENT NOT DEDUCTED'}
                      </td>
                      <td colSpan="2" className="text-left px-3 font-black text-red-600 bg-red-50/20">
                        {slip.iceRentDeducted ? 'DEDUCTED' : 'NOT DEDUCTED'}
                      </td>
                    </tr>

                    {/* In Words */}
                    <tr className="h-[36px]">
                      <td className="py-2 px-1 border-r border-[#1A365D] font-bold text-[#1A365D] text-[10px]">
                        (in words)
                      </td>
                      <td colSpan="6" className="text-left pl-4 font-black uppercase tracking-wider text-[#1A365D]">
                        {slip.inWords || '__________________________________________________'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Signature Area */}
            <div className="pt-6 mt-6 border-t border-[#1A365D]">
              <div className="flex justify-between items-end text-xs">
                <div className="text-[9px] font-bold text-[#1A365D] max-w-[200px] leading-relaxed">
                  * Dynamic billing replica. Gold Fisheries ERP Procurement Flow Validation.
                </div>
                <div className="text-right flex flex-col items-end mr-4">
                  <span className="font-extrabold text-[#1A365D] tracking-wide uppercase text-[10px]">
                    For : M.K. FISHERIES
                  </span>
                  <div className="h-10 mt-2 w-32 border-b border-dashed border-[#1A365D]/60 flex items-center justify-center text-[10px] text-slate-300 select-none">
                    SIGN HERE
                  </div>
                  <span className="font-extrabold text-[#1A365D] tracking-widest uppercase mt-2 text-[9px]">
                    Authorised Signatory
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* CSS style block specifically designed to optimize this layout for paper print */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          #root, header, nav, aside, footer, button, .print\\:hidden {
            display: none !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          .print\\:m-0 {
            margin: 0 !important;
          }
          .print\\:border-none {
            border: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:w-full {
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}} />
    </div>
  );
};

export default HarvestSlipPreview;
