import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdminStore } from '../../../store/adminStore';
import { ArrowLeft, Printer, Download, Share2, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const TapalPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tapals, fetchTapals } = useAdminStore();
  const [tapal, setTapal] = useState(null);
  const printAreaRef = useRef(null);

  useEffect(() => {
    fetchTapals();
  }, [fetchTapals]);

  useEffect(() => {
    // If it's a new unsaved preview, look in session storage
    const rawData = sessionStorage.getItem('current_tapal_creation_preview');
    if (rawData) {
      try {
        setTapal(JSON.parse(rawData));
      } catch (err) {
        toast.error('Failed to parse tapal session data');
      }
    } else {
      // Find in existing tapals list
      const found = tapals.find(t => t.id === id || t._id === id);
      if (found) {
        setTapal(found);
      }
    }
  }, [id, tapals]);

  if (!tapal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-olive"></div>
        <p className="text-sm text-text-secondary">Loading Tapal details...</p>
      </div>
    );
  }

  // Pre-fill item rows for grid visualization (standard 12 row notepad pad replica)
  const displayItems = [...(tapal.items || tapal.products || [])];
  const minRows = 12;
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

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const element = printAreaRef.current;
    if (!element) return;

    const loadToast = toast.loading('Generating Tapal PDF...');

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFFFF',
      });
      const imgData = canvas.toDataURL('image/png');

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
      const imgY = 10;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`TapalSlip_${tapal.tpNo || tapal.tapalNumber || 'Draft'}.pdf`);
      toast.success('Tapal PDF generated successfully!', { id: loadToast });
    } catch (error) {
      console.error('Error generating PDF', error);
      toast.error('Error generating PDF', { id: loadToast });
    }
  };

  // Convert weight total to words helper
  const inWords = tapal.inWords || `${tapal.totalWeight || 0} KILOGRAMS ONLY`;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500 font-sans print:p-0 print:m-0">
      {/* Action Buttons - Hidden in Print */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-card-border pb-5 print:hidden">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/admin/tapals')} 
            className="text-text-muted hover:text-[#6A7051] transition-all p-1"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold tracking-wider text-brand-olive uppercase flex items-center gap-3">
              Tapal Print Preview
            </h1>
            <p className="text-text-secondary text-sm mt-1">Print or download the official Tapal dispatch bill (without rates/prices).</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
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
        </div>
      </div>

      {/* Linked slip notification */}
      {tapal.sourceSlipNo && (
        <div className="bg-purple-50 border border-purple-200 p-3 flex items-center justify-between print:hidden">
          <span className="text-xs text-purple-800 font-bold uppercase tracking-wider">
            🔗 Linked to procurement Harvest Slip No: #{tapal.sourceSlipNo}
          </span>
          <span className="text-[10px] px-2 py-0.5 bg-purple-200 text-purple-800 font-black uppercase rounded-sm">
            Status: {tapal.status || 'Active'}
          </span>
        </div>
      )}

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
                <div className="border-t border-black w-full text-center py-1 bg-blue-50/50">
                   <h3 className="text-md font-extrabold text-[#1e3a8a] tracking-widest uppercase">★ TAPAL / LOGISTICS DISPATCH ★</h3>
                </div>
              </div>

              {/* Details Section */}
              <div className="flex border-b border-black text-[11px] leading-tight font-medium text-black h-[110px]">
                {/* Left Side Details */}
                <div className="w-1/2 border-r border-black flex flex-col">
                  <div className="flex border-b border-black h-1/4 items-center bg-slate-50/50">
                    <span className="font-bold pl-2 w-full uppercase">Customer Details :</span>
                  </div>
                  <div className="flex h-3/4 items-start pt-2">
                    <span className="font-bold pl-2 w-20 uppercase">NAME:</span>
                    <span className="pl-1 w-full uppercase font-extrabold text-blue-900 text-xs">
                      {tapal.partyName || tapal.party || tapal.buyerName || 'UNASSIGNED BUYER'}
                    </span>
                  </div>
                </div>

                {/* Right Side Details */}
                <div className="w-1/2 flex flex-col">
                  <div className="flex border-b border-black h-1/5 items-center">
                    <div className="w-1/3 border-r border-black flex items-center h-full justify-end pr-2 font-bold">
                      TP NO :
                    </div>
                    <div className="w-2/3 pl-2 font-bold text-red-600">{tapal.tpNo || tapal.tapalNumber || 'N/A'}</div>
                  </div>
                  <div className="flex border-b border-black h-1/5 items-center">
                    <div className="w-1/3 border-r border-black flex items-center h-full justify-end pr-2 font-bold">
                      Date :
                    </div>
                    <div className="w-2/3 pl-2 font-semibold">
                      {tapal.date ? new Date(tapal.date).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')}
                    </div>
                  </div>
                  <div className="flex border-b border-black h-1/5 items-center">
                    <div className="w-1/3 border-r border-black flex items-center h-full justify-end pr-2 font-bold">
                      Vehicle No :
                    </div>
                    <div className="w-2/3 pl-2 font-semibold uppercase">{tapal.vehicleNo || tapal.vehicle || 'N/A'}</div>
                  </div>
                  <div className="flex border-b border-black h-1/5 items-center">
                    <div className="w-1/3 border-r border-black flex items-center h-full justify-end pr-2 font-bold">
                      Driver Name :
                    </div>
                    <div className="w-2/3 pl-2 font-semibold uppercase">{tapal.driverName || tapal.driver || 'N/A'}</div>
                  </div>
                  <div className="flex h-1/5 items-center">
                    <div className="w-1/3 border-r border-black flex items-center h-full justify-end pr-2 font-bold">
                      Grader Name :
                    </div>
                    <div className="w-2/3 pl-2 font-semibold uppercase">{tapal.graderName || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Table Header */}
              <div className="w-full">
                <table className="w-full text-center border-collapse text-[11px] font-semibold text-black">
                  <thead>
                    <tr className="border-b border-black bg-slate-50/50">
                      <th className="py-1.5 px-1 border-r border-black w-[40px]">Sl No</th>
                      <th className="py-1.5 px-1 border-r border-black w-[90px]">Hsn Code</th>
                      <th className="py-1.5 px-1 border-r border-black text-left pl-2">Particulars</th>
                      <th className="py-1.5 px-1 border-r border-black w-[70px]">Count</th>
                      <th className="py-1.5 px-1 border-r border-black w-[80px] leading-tight">NO OF BOXES</th>
                      <th className="py-1.5 px-1 border-r border-black w-[90px]">Box Weight</th>
                      <th className="py-1.5 px-1 w-[110px]">Total Weight (KG)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayItems.map((item, index) => (
                      <tr key={item.id || index} className="border-b border-black h-[24px]">
                        <td className="border-r border-black text-center font-bold">
                          {index + 1}
                        </td>
                        <td className="border-r border-black text-center font-mono">
                          {item.hsnCode || item.hsn || ''}
                        </td>
                        <td className="border-r border-black text-left pl-2 font-bold uppercase text-blue-950">
                          {item.particulars || item.name || ''}
                        </td>
                        <td className="border-r border-black text-center font-semibold">
                          {item.count || ''}
                        </td>
                        <td className="border-r border-black text-center font-bold text-blue-900">
                          {item.noOfBoxes || item.boxes || ''}
                        </td>
                        <td className="border-r border-black text-center">
                          {item.boxWeight || item.weightPerBox ? `${item.boxWeight || item.weightPerBox} kg` : ''}
                        </td>
                        <td className="text-center font-black text-xs text-blue-950">
                          {item.totalWeight || item.weight ? `${parseFloat(item.totalWeight || item.weight).toFixed(2)}` : ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Calculations Footer Block */}
            <div className="w-full border-t border-black text-[11px] text-black">
              <div className="flex border-b border-black h-[35px] items-center">
                <div className="w-[100px] font-bold border-r border-black h-full flex items-center pl-2 uppercase bg-slate-50/50">Total Boxes:</div>
                <div className="w-1/2 font-black text-sm pl-2 text-blue-900 flex items-center h-full">{tapal.totalBoxes || tapal.totalNoOfBoxes || 0} BOXES</div>
                <div className="w-[120px] font-bold border-l border-r border-black h-full flex items-center pl-2 uppercase bg-slate-50/50">Total Weight:</div>
                <div className="w-1/2 font-black text-sm pl-2 text-blue-950 flex items-center h-full pr-2 justify-end">
                  {parseFloat(tapal.totalWeight || tapal.qty || 0).toFixed(2)} KG
                </div>
              </div>

              {/* Notes block */}
              <div className="flex border-b border-black min-h-[50px] leading-tight pt-1.5 pb-1">
                <div className="w-[100px] font-bold pl-2 uppercase">Notes:</div>
                <div className="w-full pr-2 space-y-1">
                  <div className="font-semibold text-blue-950 uppercase">{tapal.notes || 'BLACK GILL SECOND QUALITY (EXP)'}</div>
                  <div className="text-[10px] text-gray-700 italic uppercase">Complaint log: {tapal.damageNotes || 'NONE'}</div>
                </div>
              </div>

              {/* Bottom text instructions */}
              <div className="flex border-b border-black h-[30px] items-center bg-slate-50/20">
                <div className="w-[100px] font-bold border-r border-black h-full flex items-center pl-2 uppercase">In Words:</div>
                <div className="pl-2 uppercase font-extrabold text-[10px] text-gray-800 tracking-wider">
                  {inWords}
                </div>
              </div>

              {/* Signature layout */}
              <div className="flex h-[80px]">
                <div className="w-2/3 border-r border-black p-2 flex flex-col justify-between">
                  <span className="text-[9px] font-bold text-gray-500 uppercase">Receiver Sign & Stamp:</span>
                  <div className="w-32 border-b border-black/30 border-dashed mb-1"></div>
                </div>
                <div className="w-1/3 flex flex-col justify-between items-center py-2">
                  <span className="text-[9px] font-bold uppercase">For M. K. FISHERIES</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Authorised Signatory</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center py-3 text-[9px] text-gray-400 print:hidden">
             Golden Fisheries CRM - Logistics Bill System
          </div>
        </div>
      </div>
    </div>
  );
};

export default TapalPreview;
