// PDF.js variables
let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
let scale = 1.5;
let canvas = document.getElementById('pdf-viewer');
let ctx = canvas.getContext('2d');

// PDF URL - replace with your PDF path
const pdfUrl = 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf';

// Buttons and page elements
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');
const pageNumDisplay = document.getElementById('page-num');
const pageCountDisplay = document.getElementById('page-count');
const downloadButton = document.getElementById('download-button');

/**
 * Render the page
 */
function renderPage(num) {
    pageRendering = true;
    
    // Get page
    pdfDoc.getPage(num).then(function(page) {
        const viewport = page.getViewport({ scale: scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // Render PDF page
        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        
        const renderTask = page.render(renderContext);
        
        // Wait for rendering to finish
        renderTask.promise.then(function() {
            pageRendering = false;
            
            if (pageNumPending !== null) {
                // New page rendering is pending
                renderPage(pageNumPending);
                pageNumPending = null;
            }
        });
    });
    
    // Update page counter
    pageNumDisplay.textContent = num;
}

/**
 * If another page rendering is in progress, wait until it finishes.
 * Otherwise, render the page immediately.
 */
function queueRenderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
}

/**
 * Go to previous page
 */
function onPrevPage() {
    if (pageNum <= 1) {
        return;
    }
    pageNum--;
    queueRenderPage(pageNum);
}

/**
 * Go to next page
 */
function onNextPage() {
    if (pageNum >= pdfDoc.numPages) {
        return;
    }
    pageNum++;
    queueRenderPage(pageNum);
}

/**
 * Download the PDF
 */
function downloadPdf() {
    // Creating an invisible <a> element
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = pdfUrl;
    a.download = pdfUrl.split('/').pop(); // Use the filename from the URL
    
    // Append to the document and click to trigger download
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
}

// Event listeners
prevButton.addEventListener('click', onPrevPage);
nextButton.addEventListener('click', onNextPage);
downloadButton.addEventListener('click', downloadPdf);

/**
 * Initialize PDF viewer
 */
pdfjsLib.getDocument(pdfUrl).promise.then(function(pdf) {
    pdfDoc = pdf;
    pageCountDisplay.textContent = pdf.numPages;
    
    // Initial render
    renderPage(pageNum);
});
