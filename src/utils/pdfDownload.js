import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export const downloadProtectionPlanPDF = async (title, elementRef = null) => {
  try {
    let content

    // If elementRef is provided, use it; otherwise fallback to the old selector
    if (elementRef) {
      content = elementRef
    } else {
      content = document.querySelector('.my-protection-plan-modal-body')
      if (!content) {
        console.error('Protection plan content not found')
        return
      }
    }

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    // Look for the new PersonalProtectionPlan structure or fallback to old structure
    let planMain = content.querySelector('.plan-main') // Old structure

    if (!planMain) {
      // New structure - look for the main container with Segoe UI font
      planMain = content.querySelector('[style*="fontFamily"]') || content
    }

    if (!planMain) {
      console.error('Plan content not found')
      return
    }

    const pageWidth = 210
    const pageHeight = 297
    const margin = 15

    // Add a small delay to ensure content has fully rendered
    await new Promise((resolve) => setTimeout(resolve, 100))

    const canvas = await html2canvas(planMain, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: planMain.scrollWidth,
      windowHeight: planMain.scrollHeight,
      onclone: (clonedDoc) => {
        // Find the cloned element - could be plan-main or the PersonalProtectionPlan container
        let clonedElement = clonedDoc.querySelector('.plan-main')
        if (!clonedElement) {
          // For new structure, find the protection plan container by font family
          clonedElement = clonedDoc.querySelector('[style*="fontFamily"]') || clonedDoc.body.firstChild
        }

        if (clonedElement) {
          clonedElement.style.overflow = 'visible'
          clonedElement.style.backgroundColor = '#ffffff'
          clonedElement.style.color = '#000000'
          clonedElement.style.padding = '10px'
          clonedElement.style.background = '#ffffff'
        }

        // Style the main header - "YOUR PERSONAL PROTECTION PLAN"
        const mainHeaders = clonedDoc.querySelectorAll('h1')
        mainHeaders.forEach(header => {
          if (header.textContent.includes('PERSONAL PROTECTION PLAN')) {
            header.style.color = '#2c3e50'
            header.style.textShadow = 'none'
            header.style.background = '#ffffff'
            header.style.fontSize = '20px'
            header.style.marginBottom = '20px'
            header.style.textAlign = 'center'
            header.style.fontWeight = '600'
            header.style.borderBottom = '2px solid #2c3e50'
            header.style.paddingBottom = '10px'
          }
        })

        // Convert gradient section headers to print-friendly versions
        const gradientElements = clonedDoc.querySelectorAll('[style*="linear-gradient"]')
        gradientElements.forEach((el) => {
          // Check if this is a section header by looking for specific text content
          const textContent = el.textContent || ''
          if (textContent.includes('INCIDENT SUMMARY') ||
            textContent.includes('IMMEDIATE SAFETY STEPS') ||
            textContent.includes('WHAT TO SAY') ||
            textContent.includes('REMEMBER YOU ARE NOT ALONE')) {

            // Make section headers print-friendly
            el.style.background = '#2c3e50'
            el.style.color = '#ffffff'
            el.style.padding = '15px 20px'
            el.style.margin = '0'
            el.style.fontSize = '14px'
            el.style.fontWeight = '600'
            el.style.borderRadius = '0'

            // Style the title and subtitle within the header
            const titleDiv = el.querySelector('[style*="display: flex"]')
            if (titleDiv) {
              titleDiv.style.marginBottom = '4px'
            }

            const subtitleDiv = el.querySelector('[style*="fontSize: 0.9em"]')
            if (subtitleDiv) {
              subtitleDiv.style.fontSize = '12px'
              subtitleDiv.style.opacity = '0.9'
            }
          } else {
            // For other gradient elements, just remove the gradient
            el.style.background = '#ffffff'
          }
        })

        // Style the incident details box
        const incidentDetails = clonedDoc.querySelectorAll('[style*="borderLeft: 4px solid #4299e1"]')
        incidentDetails.forEach(box => {
          box.style.background = '#f8fafc'
          box.style.border = '1px solid #e2e8f0'
          box.style.borderLeft = '4px solid #4299e1'
          box.style.borderRadius = '6px'
          box.style.padding = '12px'
          box.style.margin = '10px 0'
        })

        // Style step sections
        const stepTitles = clonedDoc.querySelectorAll('[style*="fontWeight: 600"][style*="fontSize: 1.1em"]')
        stepTitles.forEach(title => {
          if (title.textContent.match(/^\d+\./)) {
            title.style.color = '#2c3e50'
            title.style.fontSize = '14px'
            title.style.fontWeight = '600'
            title.style.marginBottom = '8px'
            title.style.marginTop = '16px'
          }
        })

        // Style all lists
        const lists = clonedDoc.querySelectorAll('ul, ol')
        lists.forEach(list => {
          list.style.color = '#4a5568'
          list.style.fontSize = '13px'
          list.style.lineHeight = '1.5'
        })

        // Style list items
        const listItems = clonedDoc.querySelectorAll('li')
        listItems.forEach(item => {
          item.style.color = '#4a5568'
          item.style.marginBottom = '4px'
        })

        // Style paragraphs
        const paragraphs = clonedDoc.querySelectorAll('p')
        paragraphs.forEach(p => {
          p.style.color = '#4a5568'
          p.style.fontSize = '13px'
          p.style.lineHeight = '1.6'
          p.style.margin = '8px 0'
        })

        // Style background boxes (trusted adults, blocking instructions, etc.)
        const backgroundBoxes = clonedDoc.querySelectorAll('[style*="background: #f7fafc"]')
        backgroundBoxes.forEach(box => {
          box.style.background = '#f8fafc'
          box.style.border = '1px solid #e2e8f0'
          box.style.borderRadius = '6px'
          box.style.padding = '12px'
          box.style.margin = '8px 0'
        })

        // Style quote boxes
        const quoteBoxes = clonedDoc.querySelectorAll('[style*="borderLeft: 4px solid #9f7aea"]')
        quoteBoxes.forEach(box => {
          box.style.background = '#f7fafc'
          box.style.borderLeft = '4px solid #9f7aea'
          box.style.padding = '12px'
          box.style.margin = '10px 0'
          box.style.borderRadius = '0 6px 6px 0'
        })

        // Style strong elements
        const strongElements = clonedDoc.querySelectorAll('strong')
        strongElements.forEach((strong) => {
          strong.style.color = '#2c3e50'
          strong.style.fontWeight = '600'
        })

        // Style the legal disclaimer
        const disclaimer = clonedDoc.querySelector('[style*="fontStyle: italic"][style*="fontSize: 0.85em"]')
        if (disclaimer) {
          disclaimer.style.background = '#f8fafc'
          disclaimer.style.border = '1px solid #e2e8f0'
          disclaimer.style.borderRadius = '6px'
          disclaimer.style.padding = '12px'
          disclaimer.style.fontSize = '11px'
          disclaimer.style.color = '#718096'
          disclaimer.style.fontStyle = 'italic'
        }

        // Remove any remaining problematic styles
        const allElements = clonedDoc.querySelectorAll('*')
        allElements.forEach((el) => {
          // Remove box shadows for print
          if (el.style.boxShadow) {
            el.style.boxShadow = 'none'
          }

          // Ensure text is readable
          if (el.style.color === 'white' || el.style.color === '#ffffff') {
            // Only change if it's not in a dark background header
            const parent = el.parentElement
            if (!parent || !parent.style.background?.includes('#2c3e50')) {
              el.style.color = '#333333'
            }
          }
        })

        // Style the old structure elements if they exist
        const header = clonedDoc.querySelector('.plan-header')
        if (header) {
          header.style.background = '#f8f9fa'
          header.style.border = '2px solid #28a745'
          header.style.borderRadius = '10px'
          header.style.padding = '20px'
        }

        const title = clonedDoc.querySelector('.plan-title')
        if (title) {
          title.style.color = '#28a745'
          title.style.textShadow = 'none'
          title.style.background = 'none'
        }

        const sections = clonedDoc.querySelectorAll('.plan-section')
        sections.forEach((section) => {
          section.style.background = '#ffffff'
          section.style.border = '1px solid #dee2e6'
          section.style.borderRadius = '8px'
          section.style.padding = '20px'
          section.style.marginBottom = '20px'
          section.style.color = '#333333'
        })
      }
    })

    const imgWidth = pageWidth - 2 * margin
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    // If content is too tall for one page, split it
    if (imgHeight > pageHeight - 2 * margin) {
      const maxHeight = pageHeight - 2 * margin
      const pages = Math.ceil(imgHeight / maxHeight)

      for (let i = 0; i < pages; i++) {
        if (i > 0) pdf.addPage()

        const yOffset = i * maxHeight * (canvas.width / imgWidth)
        const sourceHeight = Math.min(
          maxHeight * (canvas.width / imgWidth),
          canvas.height - yOffset
        )

        // Create a temporary canvas for this page section
        const tempCanvas = document.createElement('canvas')
        const tempCtx = tempCanvas.getContext('2d')
        tempCanvas.width = canvas.width
        tempCanvas.height = sourceHeight

        tempCtx.drawImage(
          canvas,
          0,
          yOffset,
          canvas.width,
          sourceHeight,
          0,
          0,
          canvas.width,
          sourceHeight
        )

        const tempImgHeight = (sourceHeight * imgWidth) / canvas.width

        pdf.addImage(
          tempCanvas.toDataURL('image/png'),
          'PNG',
          margin,
          margin,
          imgWidth,
          tempImgHeight
        )
      }
    } else {
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        margin,
        margin,
        imgWidth,
        imgHeight
      )
    }

    pdf.save(`protection-plan-${title}.pdf`)
  } catch (error) {
    console.error('Error generating PDF:', error)
  }
}