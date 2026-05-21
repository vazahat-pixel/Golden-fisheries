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

  // Pad the items list with empty rows up to 12 rows to match the paper slip pad appearance
  const displayItems = [...(slip.items || [])];
  const minRows = 12;
  while (displayItems.length < minRows) {
    displayItems.push({
      id: `empty-${displayItems.length}`,
      hsnCode: '',
      particulars: '',
      count: '',
      noOfBoxes: '',
      boxWeight: '',
      totalWeight: '',
      rate: '',
      totalAmount: ''
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

  const handleWhatsAppShare = () => {
    const phone = slip.mobNumber || slip.farmerPhone || '';
    if (!phone) {
      toast.error('No farmer mobile number available');
      return;
    }
    
    // Construct message
    let message = `*M.K. FISHERIES - Harvest Slip ${slip.tpNo || ''}*\n`;
    message += `Date: ${slip.date ? new Date(slip.date).toLocaleDateString('en-GB') : ''}\n`;
    message += `Farmer: ${slip.farmerName || ''}\n\n`;
    message += `*Items:*\n`;
    (slip.items || []).forEach((item, idx) => {
      if (item.particulars) {
        message += `${idx + 1}. ${item.particulars} (Boxes: ${item.noOfBoxes || 0}, Wt: ${item.totalWeight || 0}kg)\n`;
      }
    });
    message += `\n*Grand Total:* ₹${(slip.grandTotal || 0).toLocaleString('en-IN')}\n\n`;
    message += `Please review and approve this slip. Thank you!`;
    
    const encodedText = encodeURIComponent(message);
    const url = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodedText}`;
    window.open(url, '_blank');

    // Automatically update status to 'Sent to Farmer'
    setSlip(prev => ({ ...prev, status: 'Sent to Farmer' }));
    toast.success('WhatsApp link opened! Status marked as "Sent to Farmer".');
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
            onClick={handleWhatsAppShare}
            className="flex-1 sm:flex-none border border-green-200 bg-green-50 text-green-700 px-4 py-2.5 text-xs font-black uppercase tracking-wider hover:bg-green-100 transition-all flex items-center justify-center gap-2"
          >
            <Share2 size={14} /> Share on WhatsApp
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
          className="w-[210mm] bg-white pt-[5mm] px-[5mm] shadow-xl print:shadow-none print:border-none print:p-0 print:w-full font-arial"
          style={{ fontFamily: 'Arial, sans-serif' }}
        >
          {/* Main Border */}
          <div className="border border-black flex flex-col justify-between">
            <div>
              {/* Header Box */}
              <div className="text-center pb-1 border-b border-black">
                <h1 className="text-2xl font-bold tracking-wide text-[#1e3a8a] mt-1 mb-0 pb-0">
                  M. K. FISHERIES
                </h1>
                <h2 className="text-sm font-bold text-[#1e3a8a] mt-0">
                  WHOLE SALE FISH MERCHANTS
                </h2>
                <p className="text-xs font-semibold text-[#1e3a8a] mt-0">
                  KARWAR & MANGALORE (KARNATAKA)
                </p>
                <p className="text-[10px] font-semibold text-[#1e3a8a] mt-0 mb-1">
                  Mob : 9019411439, 9663655558
                </p>
                <div className="border-t border-black w-full text-center py-1">
                   <h3 className="text-sm font-bold text-[#1e3a8a] tracking-wide">FARMER PURCHASE INVOICE</h3>
                </div>
              </div>

              {/* Details Section */}
              <div className="flex border-b border-black text-[11px] leading-tight font-medium text-black h-[110px]">
                {/* Left Side Details */}
                <div className="w-1/2 border-r border-black flex flex-col">
                  <div className="flex border-b border-black h-1/4 items-center">
                    <span className="font-bold pl-1 w-full">Customer Details :</span>
                  </div>
                  <div className="flex border-b border-black h-1/4 items-center">
                    <span className="font-semibold pl-1 w-24 uppercase">NAME</span>
                    <span className="pl-1 w-full uppercase">{slip.farmerName}</span>
                  </div>
                  <div className="flex border-b border-black h-1/4 items-center">
                    <span className="font-semibold pl-1 w-24 uppercase">CITY</span>
                    <span className="pl-1 w-full uppercase">{slip.city}</span>
                  </div>
                  <div className="flex h-1/4 items-center">
                    <span className="font-semibold pl-1 w-24 uppercase">MOB NUMBER</span>
                    <span className="pl-1 w-full">{slip.mobNumber}</span>
                  </div>
                </div>

                {/* Right Side Details */}
                <div className="w-1/2 flex flex-col">
                  <div className="flex border-b border-black h-1/5 items-center">
                    <div className="w-1/3 border-r border-black flex items-center h-full justify-end pr-1 font-bold">
                      Invoice No :
                    </div>
                    <div className="w-2/3 pl-1 font-semibold">{slip.tpNo}</div>
                  </div>
                  <div className="flex border-b border-black h-1/5 items-center">
                    <div className="w-1/3 border-r border-black flex items-center h-full justify-end pr-1 font-bold">
                      Date :
                    </div>
                    <div className="w-2/3 pl-1 font-semibold">
                      {slip.date ? new Date(slip.date).toLocaleDateString('en-GB') : ''}
                    </div>
                  </div>
                  <div className="flex border-b border-black h-1/5 items-center">
                    <div className="w-1/3 border-r border-black flex items-center h-full justify-end pr-1 font-bold">
                      Vehicle No :
                    </div>
                    <div className="w-2/3 pl-1 font-semibold uppercase">{slip.vehicleNo}</div>
                  </div>
                  <div className="flex border-b border-black h-1/5 items-center">
                    <div className="w-1/3 border-r border-black flex items-center h-full justify-end pr-1 font-bold">
                      Driver Name :
                    </div>
                    <div className="w-2/3 pl-1 font-semibold uppercase">{slip.driverName}</div>
                  </div>
                  <div className="flex h-1/5 items-center">
                    <div className="w-1/3 border-r border-black flex items-center h-full justify-end pr-1 font-bold">
                      Grader Name :
                    </div>
                    <div className="w-2/3 pl-1 font-semibold uppercase">{slip.graderName}</div>
                  </div>
                </div>
              </div>

              {/* Table Header */}
              <div className="w-full">
                <table className="w-full text-center border-collapse text-[11px] font-semibold text-black">
                  <thead>
                    <tr className="border-b border-black">
                      <th className="py-1 px-1 border-r border-black w-[40px]">Sl No</th>
                      <th className="py-1 px-1 border-r border-black w-[70px]">Hsn Code</th>
                      <th className="py-1 px-1 border-r border-black">Particulars</th>
                      <th className="py-1 px-1 border-r border-black w-[50px]">Count</th>
                      <th className="py-1 px-1 border-r border-black w-[60px] leading-tight">NO OF<br/>BOXES</th>
                      <th className="py-1 px-1 border-r border-black w-[70px]">Box Weight</th>
                      <th className="py-1 px-1 border-r border-black w-[80px]">Total Weight</th>
                      <th className="py-1 px-1 border-r border-black w-[50px]">Rate</th>
                      <th className="py-1 px-1 w-[90px]">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayItems.map((item, index) => {
                      // First row sample logic
                      let placeholderRate = "";
                      let placeholderTotalWeight = "";
                      let placeholderTotalAmount = "";
                      
                      if (index === 0 && !item.hsnCode && !item.particulars) {
                         placeholderTotalWeight = "BOX * BOX WEIGHT";
                         placeholderTotalAmount = "RATE *TOTAL WEIGHT";
                      }
                      
                      return (
                        <tr key={item.id} className="border-b border-black h-[22px]">
                          <td className="border-r border-black">
                            {index + 1}
                          </td>
                          <td className="border-r border-black">
                            {item.hsnCode || ''}
                          </td>
                          <td className="border-r border-black text-left pl-1">
                            {item.particulars || ''}
                          </td>
                          <td className="border-r border-black">
                            {item.count || ''}
                          </td>
                          <td className="border-r border-black">
                            {item.noOfBoxes || ''}
                          </td>
                          <td className="border-r border-black">
                            {item.boxWeight ? `${item.boxWeight}` : ''}
                          </td>
                          <td className="border-r border-black">
                            {item.totalWeight ? `${parseFloat(item.totalWeight).toFixed(2)}` : (placeholderTotalWeight || '')}
                          </td>
                          <td className="border-r border-black">
                            {item.rate || placeholderRate || ''}
                          </td>
                          <td className="text-right pr-1">
                            {item.totalAmount ? `${parseFloat(item.totalAmount).toFixed(2)}` : (placeholderTotalAmount || '-')}
                          </td>
                        </tr>
                      );
                    })}

                    {/* Totals Row */}
                    <tr className="border-b border-black font-bold h-[22px]">
                      <td colSpan="4" className="border-r border-black"></td>
                      <td className="border-r border-black text-center">{slip.totalBoxes || '0'}</td>
                      <td className="border-r border-black"></td>
                      <td className="border-r border-black text-center">{slip.totalWeight ? parseFloat(slip.totalWeight).toFixed(2) : '0'}</td>
                      <td className="border-r border-black"></td>
                      <td className="text-right pr-1">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Deductions & Signatures Area */}
              <div className="w-full flex flex-col text-[10px] font-bold text-black border-b border-black">
                
                {/* Notes Row 1 */}
                <div className="flex border-b border-black h-[22px]">
                  <div className="w-2/3 border-r border-black bg-[#FDF9EA] flex items-center justify-center">
                    NOTES ( BLACK GILL SECOND QUALITY ) ( EXP )
                  </div>
                  <div className="w-1/6 border-r border-black flex items-center justify-center">
                    TDS @ 194Q
                  </div>
                  <div className="w-1/6 flex items-center justify-end pr-1 font-semibold">
                    {slip.tds ? parseFloat(slip.tds).toFixed(2) : ''}
                  </div>
                </div>

                {/* Notes Row 2 */}
                <div className="flex border-b border-black h-[22px]">
                  <div className="w-2/3 border-r border-black flex items-center justify-center">
                    THIRD QUALITY DAMAGE METERIALS & DIO COMPLAINT
                  </div>
                  <div className="w-1/6 border-r border-black flex items-center justify-center">
                    COMISSION
                  </div>
                  <div className="w-1/6 flex items-center justify-end pr-1 font-semibold">
                     {slip.commission ? parseFloat(slip.commission).toFixed(2) : ''}
                  </div>
                </div>

                {/* Notes Row 3 */}
                <div className="flex border-b border-black h-[22px]">
                  <div className="w-2/3 border-r border-black flex items-center justify-center text-red-600">
                    {slip.iceRentDeducted ? 'ICE & VEHICLE RENT DEDUCTED' : 'ICE & VEHICLE RENT NOT DEDUCTED'}
                  </div>
                  <div className="w-1/6 border-r border-black flex items-center justify-center">
                    SOFT
                  </div>
                  <div className="w-1/6 flex items-center justify-end pr-1 font-semibold">
                    {slip.soft ? parseFloat(slip.soft).toFixed(2) : ''}
                  </div>
                </div>

                {/* Grand Total Row */}
                <div className="flex h-[22px]">
                  <div className="w-2/3 border-r border-black flex items-center justify-center">
                  </div>
                  <div className="w-1/6 border-r border-black flex items-center justify-center">
                    Grand Total
                  </div>
                  <div className="w-1/6 flex items-center justify-end pr-1 font-bold">
                    {slip.grandTotal ? parseFloat(slip.grandTotal).toFixed(2) : ''}
                  </div>
                </div>

              </div>

              {/* In Words & Signatures */}
              <div className="flex border-t border-black h-[26px]">
                <div className="w-[80px] border-r border-black flex items-center justify-center font-bold text-[11px]">
                  (in words)
                </div>
                <div className="flex-1 flex items-center pl-2 font-bold text-[11px] uppercase">
                   {slip.inWords || ''}
                </div>
              </div>
              
              <div className="flex w-full mt-1 border-t border-black min-h-[90px]">
                 <div className="w-2/3 border-r border-black">
                     {/* Empty signature space left */}
                 </div>
                 <div className="w-1/3 flex flex-col justify-between pt-1 pb-2">
                     <div className="text-[10px] pl-2">
                         For : M.K. FISHERIES
                     </div>
                     <div className="text-[10px] pl-2 flex justify-center mt-12 w-full">
                         Authorised Signatory
                     </div>
                 </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      
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
