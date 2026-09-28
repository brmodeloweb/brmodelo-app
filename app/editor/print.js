const PRINT_PADDING = 10;

export default function printPaper(paper) {
	const doc = paper.el.ownerDocument;
	let area = paper.getContentArea().inflate(PRINT_PADDING);
	if (area.width <= 0 || area.height <= 0) {
		area = paper.getArea();
	}
	const rect = paper.localToPaperRect(area);

	const svg = paper.svg.cloneNode(true);
	svg.setAttribute('viewBox', `${rect.x} ${rect.y} ${rect.width} ${rect.height}`);
	svg.setAttribute('preserveAspectRatio', 'xMinYMin meet');
	svg.removeAttribute('width');
	svg.removeAttribute('height');

	const iframe = doc.createElement('iframe');
	iframe.style.position = 'fixed';
	iframe.style.right = '100%';
	doc.body.appendChild(iframe);

	const printDoc = iframe.contentDocument;
	printDoc.open();
	printDoc.write(`<!doctype html><html><head><style>
		@page { size: A4 landscape; margin: 0.5in; }
		html, body { margin: 0; height: 100%; }
		svg { width: 100%; height: 100%; }
	</style></head><body></body></html>`);
	printDoc.close();
	printDoc.body.appendChild(printDoc.importNode(svg, true));

	const printWindow = iframe.contentWindow;
	printWindow.addEventListener('afterprint', () => iframe.remove());
	printWindow.focus();
	printWindow.print();
};
