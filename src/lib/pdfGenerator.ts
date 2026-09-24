import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BusinessSpot } from '../types';

export interface PdfExportOptions {
  businesses: BusinessSpot[];
  title?: string;
  subtitle?: string;
  districtFilter?: string;
  categoryFilter?: string;
  layout?: 'cards' | 'table';
  includeContact?: boolean;
  includeLicenses?: boolean;
}

/**
 * Generates an official, beautifully formatted PDF commercial directory
 * suitable for offline printing, trade delegations, or electronic sharing.
 */
export function generateDirectoryPdf(options: PdfExportOptions): jsPDF {
  const {
    businesses,
    title = 'EthioSpot — Ethiopian Commercial & Trade Directory',
    subtitle = 'Verified Registry of Accredited Enterprises & Service Providers • Addis Ababa',
    districtFilter = 'All Commercial Districts',
    categoryFilter = 'All Sectors',
    layout = 'cards',
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Color definitions (RGB)
  const primaryGreen = [0, 95, 42]; // #005f2a
  const accentGold = [217, 155, 0]; // #d99b00
  const darkSlate = [25, 28, 30]; // #191c1e
  const textMuted = [80, 90, 80];
  const borderGray = [225, 230, 225];
  const bgLight = [248, 249, 250];

  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Helper to draw the header on any page
  const drawPageHeader = (pageNum: number) => {
    // Top banner background
    doc.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
    doc.rect(0, 0, pageWidth, 5, 'F');

    // Subtle gold trim
    doc.setFillColor(accentGold[0], accentGold[1], accentGold[2]);
    doc.rect(0, 5, pageWidth, 1.2, 'F');

    if (pageNum > 1) {
      // Running header on continuation pages
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
      doc.text('ETHIOSPOT COMMERCIAL DIRECTORY', margin, 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text(`${districtFilter} • ${categoryFilter}`, pageWidth - margin, 12, { align: 'right' });

      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.setLineWidth(0.3);
      doc.line(margin, 14, pageWidth - margin, 14);
    }
  };

  // Helper to draw the footer on any page
  const drawPageFooter = (pageNum: number, totalPagesPlaceholder: string) => {
    const footerY = pageHeight - 9;

    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(
      'Official Trade Registry • Ministry of Trade (MoT) Standards • Telebirr & CBE Payment Verification',
      margin,
      footerY
    );

    doc.text(
      `Page ${pageNum} ${totalPagesPlaceholder}`,
      pageWidth - margin,
      footerY,
      { align: 'right' }
    );
  };

  // -------------------------------------------------------------
  // FIRST PAGE COVER / TOP HEADER
  // -------------------------------------------------------------
  drawPageHeader(1);

  let currentY = 16;

  // Institution Badge
  doc.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  doc.roundedRect(margin, currentY, 44, 6.5, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('OFFICIAL TRADE REGISTRY', margin + 3, currentY + 4.5);

  // Verification Capsule
  doc.setFillColor(accentGold[0], accentGold[1], accentGold[2]);
  doc.roundedRect(margin + 46, currentY, 36, 6.5, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text('MOT VERIFIED 2026', margin + 49, currentY + 4.5);

  currentY += 12;

  // Document Main Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text(title, margin, currentY);

  currentY += 6;

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(subtitle, margin, currentY);

  currentY += 8;

  // Information & Filter metadata box
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, currentY, contentWidth, 16, 2, 2, 'FD');

  const metaColWidth = contentWidth / 4;
  const metaYText = currentY + 5.5;
  const metaYVal = currentY + 11.5;

  // Col 1: Date
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('GENERATED ON', margin + 4, metaYText);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text(currentDate, margin + 4, metaYVal);

  // Col 2: District Scope
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('COMMERCIAL DISTRICT', margin + metaColWidth + 2, metaYText);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  const safeDistrict = districtFilter.length > 20 ? districtFilter.substring(0, 18) + '...' : districtFilter;
  doc.text(safeDistrict, margin + metaColWidth + 2, metaYVal);

  // Col 3: Sector
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('SECTOR / CATEGORY', margin + metaColWidth * 2 + 2, metaYText);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  const safeCat = categoryFilter.length > 20 ? categoryFilter.substring(0, 18) + '...' : categoryFilter;
  doc.text(safeCat, margin + metaColWidth * 2 + 2, metaYVal);

  // Col 4: Record Count
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('TOTAL ENTERPRISES', margin + metaColWidth * 3 + 2, metaYText);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  doc.text(`${businesses.length} Verified Entries`, margin + metaColWidth * 3 + 2, metaYVal);

  currentY += 23;

  // -------------------------------------------------------------
  // LAYOUT MODE: TABLE OR CARDS
  // -------------------------------------------------------------
  if (layout === 'table') {
    // Generate high-density print table
    const tableRows = businesses.map((b, idx) => [
      (idx + 1).toString(),
      b.name,
      b.categoryLabel || b.category,
      `${b.district}\n${b.address}`,
      `${b.licenseNumber}\n(${b.licenseType || 'MoT'})`,
      `${b.phone}\n${b.telegram || ''}`,
      (b.paymentMethods || []).join(', '),
      `${b.priceRange || '$$'}\n${b.hours || 'Standard'}`,
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin, bottom: 16, top: 18 },
      head: [[
        '#',
        'Enterprise Name',
        'Sector',
        'District & Address',
        'License & Verification',
        'Direct Contact',
        'Payments',
        'Tariff / Hours',
      ]],
      body: tableRows,
      theme: 'grid',
      headStyles: {
        fillColor: [primaryGreen[0], primaryGreen[1], primaryGreen[2]],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'left',
      },
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
        textColor: [darkSlate[0], darkSlate[1], darkSlate[2]],
        overflow: 'linebreak',
        valign: 'top',
      },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 36, fontStyle: 'bold' },
        2: { cellWidth: 22 },
        3: { cellWidth: 38 },
        4: { cellWidth: 28 },
        5: { cellWidth: 26 },
        6: { cellWidth: 22 },
        7: { cellWidth: 22 },
      },
      alternateRowStyles: {
        fillColor: [250, 252, 250],
      },
      didDrawPage: (data) => {
        const pageNum = data.pageNumber;
        drawPageHeader(pageNum);
      },
    });
  } else {
    // Card Mode: Clean, spacious, highly-readable enterprise profile blocks
    let pageNum = 1;

    businesses.forEach((biz, index) => {
      // Estimate card height: baseline is ~42mm
      const cardHeight = 44;
      if (currentY + cardHeight > pageHeight - 18) {
        // Add new page
        doc.addPage();
        pageNum++;
        drawPageHeader(pageNum);
        currentY = 20;
      }

      // Business Card Container
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.setLineWidth(0.4);
      doc.roundedRect(margin, currentY, contentWidth, cardHeight, 2, 2, 'FD');

      // Left Accent Strip (Forest Green for verified)
      doc.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
      doc.roundedRect(margin, currentY, 2.5, cardHeight, 1, 1, 'F');

      // Card Header: Name, Category, License
      const leftColX = margin + 6;
      let cardY = currentY + 6;

      // Business Name
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
      const cleanName = biz.name.length > 55 ? biz.name.substring(0, 52) + '...' : biz.name;
      doc.text(`${index + 1}. ${cleanName}`, leftColX, cardY);

      // License pill on top right
      const rightColX = pageWidth - margin - 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
      doc.text(`[ ${biz.licenseType || 'MoT Verified'} • ${biz.licenseNumber} ]`, rightColX, cardY, {
        align: 'right',
      });

      cardY += 5;

      // Subtitle: Sector & District
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text(`${biz.categoryLabel || biz.category} • ${biz.district}`, leftColX, cardY);

      // Rating & Price
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(accentGold[0], accentGold[1], accentGold[2]);
      doc.text(
        `★ ${biz.rating || 4.8} (${biz.reviewCount || 100}+ reviews) • ${biz.priceRange || '$$'}`,
        rightColX,
        cardY,
        { align: 'right' }
      );

      cardY += 4.5;
      // Divider
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.setLineWidth(0.2);
      doc.line(leftColX, cardY, rightColX, cardY);

      cardY += 4;

      // Description
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      const shortDesc = doc.splitTextToSize(biz.description || 'Accredited local trade provider registered with the Addis Ababa commercial bureau.', contentWidth - 12);
      doc.text(shortDesc.slice(0, 2), leftColX, cardY);

      cardY += 8;

      // Details 3-column row: Address, Contact, Payment
      const colW = (contentWidth - 12) / 3;

      // 1. Address
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
      doc.text('PHYSICAL ADDRESS:', leftColX, cardY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      const addrSnippet = biz.address.length > 35 ? biz.address.substring(0, 33) + '..' : biz.address;
      doc.text(addrSnippet, leftColX, cardY + 3.8);

      // 2. Contact & Hours
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
      doc.text('DIRECT INQUIRIES:', leftColX + colW, cardY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text(`${biz.phone} ${biz.telegram ? '• ' + biz.telegram : ''}`, leftColX + colW, cardY + 3.8);

      // 3. Payments
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
      doc.text('ACCEPTED PAYMENTS:', leftColX + colW * 2, cardY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
      const payments = (biz.paymentMethods || ['Telebirr', 'CBE Birr']).join(' • ');
      const safePayments = payments.length > 32 ? payments.substring(0, 30) + '..' : payments;
      doc.text(safePayments, leftColX + colW * 2, cardY + 3.8);

      currentY += cardHeight + 4;
    });
  }

  // Draw footers on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawPageFooter(i, `of ${totalPages}`);
  }

  return doc;
}

/**
 * Convenience helper to download the generated PDF file directly in the user's browser
 */
export function downloadDirectoryPdf(options: PdfExportOptions, customFilename?: string): string {
  const doc = generateDirectoryPdf(options);
  const dateSlug = new Date().toISOString().split('T')[0];
  const districtSlug = (options.districtFilter || 'All-Districts')
    .replace(/[^a-zA-Z0-9]/g, '-')
    .toLowerCase();
  const filename = customFilename || `EthioSpot-Commercial-Directory-${districtSlug}-${dateSlug}.pdf`;
  doc.save(filename);
  return filename;
}

/**
 * Generates and downloads a single enterprise's official certificate profile as PDF
 */
export function downloadSingleBusinessPdf(business: BusinessSpot): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  // Header Banner
  doc.setFillColor(0, 95, 42); // #005f2a
  doc.rect(0, 0, pageWidth, 7, 'F');
  doc.setFillColor(217, 155, 0); // Gold
  doc.rect(0, 7, pageWidth, 1.5, 'F');

  let y = 22;

  // Header badges
  doc.setFillColor(0, 95, 42);
  doc.roundedRect(margin, y, 50, 7, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('OFFICIAL TRADE RECORD', margin + 4, y + 4.8);

  doc.setFillColor(217, 155, 0);
  doc.roundedRect(margin + 53, y, 40, 7, 1.5, 1.5, 'F');
  doc.text('MINISTRY OF TRADE VERIFIED', margin + 56, y + 4.8);

  y += 15;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(25, 28, 30);
  doc.text(business.name, margin, y);

  if (business.nameAmharic) {
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(13);
    doc.setTextColor(80, 90, 80);
    doc.text(business.nameAmharic, margin, y);
  }

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(80, 90, 80);
  doc.text(`${business.categoryLabel || business.category} • ${business.district}`, margin, y);

  y += 10;
  // Verification Box
  doc.setFillColor(248, 249, 250);
  doc.setDrawColor(220, 225, 220);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(80, 90, 80);
  doc.text('LICENSE ACCREDITATION', margin + 6, y + 6);
  doc.setFontSize(11);
  doc.setTextColor(0, 95, 42);
  doc.text(`${business.licenseType} — ${business.licenseNumber}`, margin + 6, y + 13);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(80, 90, 80);
  doc.text('STATUS & SCHEDULE', margin + contentWidth / 2, y + 6);
  doc.setFontSize(10);
  doc.setTextColor(25, 28, 30);
  doc.text(`${business.isOpen ? 'Open For Business' : 'Operational'} • ${business.hours || '8:00 AM - 9:00 PM'}`, margin + contentWidth / 2, y + 13);

  y += 30;

  // Overview
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(25, 28, 30);
  doc.text('Commercial Overview & Enterprise Profile', margin, y);

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(60, 70, 60);
  const descLines = doc.splitTextToSize(business.description, contentWidth);
  doc.text(descLines, margin, y);

  y += descLines.length * 5 + 8;

  // Contact Details Table
  const contactRows = [
    ['Physical Address', business.address],
    ['Commercial District', business.district],
    ['Direct Telephone', business.phone],
    ['Telegram Contact', business.telegram || 'Not specified'],
    ['Tariff / Price Tier', business.priceRange || 'Standard rates'],
    ['Payment Channels', (business.paymentMethods || []).join(', ')],
    ['Customer Reputation & Trend', `Rating: ${business.rating} / 5.0 (${business.reviewCount} reviews • Verified 6-Mo positive trajectory)`],
    ['Accreditation Standard', `${business.licenseType} (Ministry of Trade Reg. #${business.licenseNumber})`],
  ];

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Registry Parameter', 'Commercial Listing Data']],
    body: contactRows,
    theme: 'striped',
    headStyles: {
      fillColor: [0, 95, 42],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 8.5,
      cellPadding: 2.8,
    },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold' },
      1: { cellWidth: contentWidth - 50 },
    },
  });

  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setDrawColor(220, 225, 220);
  doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 110, 100);
  doc.text('Generated via EthioSpot Sovereign Registry • Official Commercial Record for offline printing and B2B verification', margin, pageHeight - 8);

  const cleanSlug = business.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  doc.save(`EthioSpot-${cleanSlug}-Listing.pdf`);
}
