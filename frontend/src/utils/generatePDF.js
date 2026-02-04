import jsPDF from 'jspdf'
import 'jspdf-autotable'

export const generatePDF = (reportData) => {
    try {
        const doc = new jsPDF()
        const { subject, statistics, feedback } = reportData

        // Title
        doc.setFontSize(20)
        doc.setTextColor(40, 40, 40)
        doc.text('Institute Feedback Report', 105, 15, { align: 'center' })

        // Subject Info
        doc.setFontSize(12)
        doc.setTextColor(60, 60, 60)
        doc.text(`Subject: ${subject.title} (${subject.code})`, 14, 30)
        doc.text(`Teacher: ${subject.teacher_name}`, 14, 38)
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 46)

        // Statistics Summary
        doc.setFontSize(14)
        doc.setTextColor(0, 0, 0)
        doc.text('Statistics Summary', 14, 60)

        const statsData = [
            ['Total Responses', statistics.total_responses || 0],
            ['Average Rating', statistics.average_rating || 'N/A'],
            ['5 Star Ratings', (statistics.rating_distribution && statistics.rating_distribution[5]) || 0],
            ['4 Star Ratings', (statistics.rating_distribution && statistics.rating_distribution[4]) || 0],
            ['3 Star Ratings', (statistics.rating_distribution && statistics.rating_distribution[3]) || 0],
            ['2 Star Ratings', (statistics.rating_distribution && statistics.rating_distribution[2]) || 0],
            ['1 Star Ratings', (statistics.rating_distribution && statistics.rating_distribution[1]) || 0],
        ]

        doc.autoTable({
            startY: 65,
            head: [['Metric', 'Value']],
            body: statsData,
            theme: 'striped',
            headStyles: { fillColor: [102, 126, 234] }
        })

        // Text Responses
        if (statistics.text_responses && statistics.text_responses.length > 0) {
            let finalY = doc.lastAutoTable.finalY + 15
            doc.text('Student Comments', 14, finalY)

            const commentsData = statistics.text_responses.map(r => [r.question, r.response])

            doc.autoTable({
                startY: finalY + 5,
                head: [['Question', 'Response']],
                body: commentsData,
                theme: 'grid',
                headStyles: { fillColor: [118, 75, 162] },
                columnStyles: { 0: { cellWidth: 60 }, 1: { cellWidth: 'auto' } }
            })
        }

        // Save PDF
        doc.save(`Feedback_Report_${subject.code}_${new Date().toISOString().split('T')[0]}.pdf`)
        console.log('PDF generated successfully')
    } catch (error) {
        console.error('Error generating PDF:', error)
        alert('Error generating PDF. Please check the console for details.')
    }
}
