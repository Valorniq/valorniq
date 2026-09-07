import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface ExportOptions {
  elementId: string;
  fileName: string;
  isDark: boolean;
  scale?: number;
  reportTitle?: string;
  enterpriseMetadata?: {
    tenantName: string;
    executiveUser: string;
    timestamp: string;
  };
}

export async function exportElementToPNG(options: ExportOptions): Promise<string> {
  const { elementId, fileName, isDark, scale = 2 } = options;
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found for PNG export.`);
  }

  try {
    const canvas = await html2canvas(element, {
      scale: scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: isDark ? '#0f172a' : '#ffffff',
      logging: false,
    });

    const dataUrl = canvas.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    link.download = `${fileName}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return dataUrl;
  } catch (error) {
    console.error('Failed to export view to PNG:', error);
    throw error;
  }
}

export async function exportElementToPDF(options: ExportOptions): Promise<void> {
  const { elementId, fileName, isDark, scale = 2 } = options;
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found for PDF export.`);
  }

  try {
    const canvas = await html2canvas(element, {
      scale: scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: isDark ? '#090d16' : '#fcfcfc',
      logging: false
    });

    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    const pdf = new jsPDF({
      orientation: imgWidth > imgHeight ? 'l' : 'p',
      unit: 'px',
      format: [imgWidth, imgHeight]
    });

    pdf.addImage(
      canvas.toDataURL('image/png', 1.0),
      'PNG',
      0,
      0,
      imgWidth,
      imgHeight,
      undefined,
      'FAST'
    );

    pdf.save(`${fileName}.pdf`);
  } catch (error) {
    console.error('Failed to export view to PDF:', error);
    throw error;
  }
}

export async function compileExecutivePresentationPDF(
  widgets: Array<{ id: string; title: string }>,
  options: Omit<ExportOptions, 'elementId'>
): Promise<void> {
  const { fileName, isDark, scale = 2, reportTitle = 'Corporate Executive Report', enterpriseMetadata } = options;
  
  try {
    const pdf = new jsPDF({
      orientation: 'l',
      unit: 'pt',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const themeBg = isDark ? '#0b0f19' : '#fafafa';
    const primaryColor = '#6E56CF';
    const textColor = isDark ? '#ffffff' : '#0f172a';
    const subtitleColor = isDark ? '#94a3b8' : '#475569';
    const accentLineColor = '#3b82f6';

    pdf.setFillColor(themeBg);
    pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');

    pdf.setFillColor(primaryColor);
    pdf.rect(0, 0, 16, pdfHeight, 'F');

    pdf.setTextColor(textColor);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(26);
    pdf.text(reportTitle.toUpperCase(), 48, 160);

    pdf.setFillColor(accentLineColor);
    pdf.rect(48, 185, 120, 3, 'F');

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    pdf.setTextColor(subtitleColor);
    pdf.text('VALORNIQ ERP + CRM SYSTEMS — EXECUTIVE BRIEFING', 48, 215);

    if (enterpriseMetadata) {
      pdf.setFontSize(10);
      pdf.setTextColor(primaryColor);
      pdf.setFont('helvetica', 'bold');
      pdf.text('TENANT ISOLATE:', 48, pdfHeight - 120);
      pdf.setTextColor(textColor);
      pdf.setFont('helvetica', 'normal');
      pdf.text(enterpriseMetadata.tenantName, 175, pdfHeight - 120);

      pdf.setTextColor(primaryColor);
      pdf.setFont('helvetica', 'bold');
      pdf.text('OFFICER / USER:', 48, pdfHeight - 95);
      pdf.setTextColor(textColor);
      pdf.setFont('helvetica', 'normal');
      pdf.text(enterpriseMetadata.executiveUser, 240, pdfHeight - 95);

      pdf.setTextColor(primaryColor);
      pdf.setFont('helvetica', 'bold');
      pdf.text('GENERATION DATE:', 48, pdfHeight - 70);
      pdf.setTextColor(textColor);
      pdf.setFont('helvetica', 'normal');
      pdf.text(enterpriseMetadata.timestamp, 190, pdfHeight - 70);
    }

    for (const widget of widgets) {
      const element = document.getElementById(widget.id);
      if (!element) continue;

      const canvas = await html2canvas(element, {
        scale: scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: isDark ? '#090d16' : '#ffffff',
        logging: false
      });

      pdf.addPage('a4', 'l');
      
      pdf.setFillColor(themeBg);
      pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');

      pdf.setFillColor(isDark ? '#111827' : '#f1f5f9');
      pdf.rect(0, 0, pdfWidth, 45, 'F');

      pdf.setTextColor(textColor);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(13);
      pdf.text(widget.title, 24, 27);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(subtitleColor);
      const rightLabel = enterpriseMetadata ? `${enterpriseMetadata.tenantName} · ${enterpriseMetadata.timestamp}` : 'VALORNIQ EXECUTIVE PORTAL';
      pdf.text(rightLabel, pdfWidth - 24, 27, { align: 'right' });

      const margin = 24;
      const contentX = margin;
      const contentY = 65;
      const maxWidth = pdfWidth - (margin * 2);
      const maxHeight = pdfHeight - contentY - margin;

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      let targetWidth = maxWidth;
      let targetHeight = (canvasHeight / canvasWidth) * targetWidth;

      if (targetHeight > maxHeight) {
        targetHeight = maxHeight;
        targetWidth = (canvasWidth / canvasHeight) * targetHeight;
      }

      const xPivot = contentX + ((maxWidth - targetWidth) / 2);
      const yPivot = contentY + ((maxHeight - targetHeight) / 2);

      pdf.addImage(
        canvas.toDataURL('image/png', 1.0),
        'PNG',
        xPivot,
        yPivot,
        targetWidth,
        targetHeight,
        undefined,
        'FAST'
      );
    }

    pdf.save(`${fileName}.pdf`);
  } catch (error) {
    console.error('Failed to export presentation PDF:', error);
    throw error;
  }
}
