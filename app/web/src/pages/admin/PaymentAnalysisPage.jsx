import React, { useRef } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { DollarSign, CreditCard, CheckCircle, Clock } from 'lucide-react'; // Import icons used in SummaryCard

// Register Chart.js components
ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
);

// ----------------------
// SummaryCard Helper (Local definition for report integrity)
// ----------------------
const SummaryCard = ({ title, value, icon, color, text }) => (
    <div className="bg-white rounded-lg shadow-md p-4 flex items-center border border-gray-100">
        <div className={`p-3 rounded-full ${color}`}>
            {React.cloneElement(icon, { className: `h-6 w-6 ${text}` })}
        </div>
        <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
    </div>
);


const PaymentAnalysisPage = ({ formatPrice, currencyCode }) => {
    const reportRef = useRef(null);
    const { user } = useAuth(); 

    // --- Data Fetching ---
    const { data: financialData, isLoading } = useQuery(
        'admin-payments-analysis',
        async () => {
            const res = await axios.get('/admin/payments/analysis'); 
            console.log('res: ', res.data);
            return res.data;
        }
    );

    const { 
        totalPaid = 0, 
        totalPending = 0, 
        recentPayouts = [] 
    } = financialData || {};

    // --- Core Calculation ---
    // The total payout amount is the sum of paid and currently pending amounts.
    const totalOutgoingPayouts = totalPaid + totalPending;

    // --- PDF Download Handler (No change) ---
    const handleDownload = async () => {
        const input = reportRef.current;
        if (!input) return;

        const canvas = await html2canvas(input, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');

        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        pdf.save('payment-analysis-report.pdf');
    };

    if (isLoading) {
        return <LoadingSpinner size="lg" />;
    }

    // --- Chart Data Preparation ---

    // Chart 1: Payout Status Pie Chart (Paid vs. Pending)
    const statusPieData = {
        labels: ['Total Outgoing (Paid)', 'Total Pending'],
        datasets: [
            {
                label: `Amount (${currencyCode})`,
                data: [totalPaid, totalPending],
                backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 206, 86, 0.6)'],
                borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 206, 86, 1)'],
                borderWidth: 1
            }
        ]
    };

    // Chart 2: Recent Payouts Bar Chart (Grouped by date/month)
    const recentData = recentPayouts.slice(0, 10).sort((a, b) => new Date(a.date) - new Date(b.date));
    const payoutBarData = {
        labels: recentData.map(p => new Date(p.date).toLocaleDateString()), // Last 10 payouts
        datasets: [
            {
                label: `Payout Amount (${currencyCode})`,
                data: recentData.map(p => p.amount),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }
        ]
    };
    
    // Sort recentPayouts for table display (newest first)
    // Assuming 'status' is provided in recentPayouts objects
    const sortedPayouts = [...recentPayouts].sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="report-container p-6 bg-white shadow-xl rounded-lg">
            
            {/* Download Button outside report content */}
            <button 
                onClick={handleDownload} 
                className="download-btn bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors mb-6"
            >
                Download Payment Analysis Report
            </button>
            
            {/* REPORT CONTENT for PDF GENERATION */}
            <div ref={reportRef} className="report-content p-6 border border-gray-300">
                
                <header className="report-header text-center border-b pb-4 mb-6">
                    <div className='flex justify-center mb-3'>
                        <img src='/SportifyLogo.png' alt='Sportify Logo' className='w-48 h-auto'/> 
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">Supplier Payment Analysis Report</h1>
                    <p className="text-gray-600 mt-2">Generated by {user?.firstName || 'Admin'} on: {new Date().toLocaleDateString()}</p>
                </header>

                {/* Section 1: Financial Summary - CORRECTED */}
                <section className="report-charts-summary grid grid-cols-3 gap-6 mb-8">
                    <SummaryCard 
                        title="Total Paid" 
                        value={formatPrice(totalPaid)} 
                        icon={<CheckCircle />} 
                        color="bg-green-100" 
                        text="text-green-600" 
                    />
                    <SummaryCard 
                        title="Total Pending" 
                        value={formatPrice(totalPending)} 
                        icon={<CreditCard />} 
                        color="bg-yellow-100" 
                        text="text-yellow-600" 
                    />
                    <SummaryCard 
                        title="Total Outgoing" 
                        value={formatPrice(totalOutgoingPayouts)} 
                        icon={<DollarSign />} 
                        color="bg-blue-100" 
                        text="text-blue-600" 
                    />
                </section>

                {/* Section 2: Charts */}
                <section className="report-section grid grid-cols-2 gap-6 mb-8">
                    <div className="chart-container p-4 border rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">Paid vs. Pending Payouts</h3>
                        <Pie data={statusPieData} options={{ maintainAspectRatio: true, plugins: { legend: { position: 'bottom' } } }} />
                    </div>
                    <div className="chart-container p-4 border rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">Recent Payout History (Last 10)</h3>
                        <Bar data={payoutBarData} options={{ maintainAspectRatio: true, plugins: { legend: { display: false } } }} />
                    </div>
                </section>

                {/* Section 3: Detailed Table */}
                <section className="report-section mb-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Detailed Payout History</h2>
                    <div className="table-responsive border rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount ({currencyCode})</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {sortedPayouts.length > 0 ? (
                                    sortedPayouts.map((p, index) => (
                                        <tr key={index} className={p.status !== 'Paid' ? 'bg-yellow-50' : ''}>
                                            <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{new Date(p.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 text-right">{formatPrice(p.amount)}</td>
                                            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">{p.supplierName || p.supplierId}</td>
                                            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">
                                                <span className={`px-2 py-1 text-xs rounded-full ${p.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {p.status || 'Paid'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="4" className="text-center py-4 text-gray-500">No recent payout data available.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Footer: Signature and Date */}
                <footer className='sign mt-16 text-sm text-gray-700'>
                    <div className='flex justify-between'>
                        <div>
                            <p><strong>Prepared By:</strong> {user?.firstName} {user?.lastName || 'Admin'}</p>
                            <p><strong>Date :</strong> {new Date().toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="border-t border-gray-400 pt-1 w-48 text-center">Authorized Signature</p>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

// --- Re-export the main component function ---
export function PaymentAnalysisPageWrapper(props) {
    // Assuming useSettings is available here to get currencyCode
    const { settings } = { settings: { currency: 'LKR' } }; // Mocked or fetched settings
    const currencyCode = settings?.currency || 'LKR';
    
    // FormatPrice helper function (re-used from AdminPayments)
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyCode 
        }).format(price || 0);
    };

    return <PaymentAnalysisPage {...props} formatPrice={formatPrice} currencyCode={currencyCode} />;
}