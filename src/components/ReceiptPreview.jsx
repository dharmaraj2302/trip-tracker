function getFileKind(url) {
  const clean = url.split('?')[0].toLowerCase()
  if (/\.(jpg|jpeg|png|gif|webp|heic|bmp)$/.test(clean)) return 'image'
  if (/\.pdf$/.test(clean)) return 'pdf'
  return 'other'
}

export default function ReceiptPreview({ url, onClose }) {
  const kind = getFileKind(url)

  return (
    <div
      className="fixed inset-0 bg-ink/90 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-paper rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate/20">
          <p className="font-display text-xl text-ink">Receipt</p>
          <div className="flex items-center gap-3">
            
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-teal underline"
            >
              Open in new tab
            </a>
            <button
              onClick={onClose}
              className="text-ink text-xl leading-none px-2"
              aria-label="Close"
            >
              &times;
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-ink/5 flex items-center justify-center p-4">
          {kind === 'image' && (
            <img src={url} alt="Receipt" className="max-w-full max-h-[75vh] rounded-lg object-contain" />
          )}

          {kind === 'pdf' && (
            <iframe
              src={url}
              title="Receipt PDF"
              className="w-full h-[75vh] rounded-lg bg-white"
            />
          )}

          {kind === 'other' && (
            <div className="text-center py-10">
              <p className="text-slate mb-3">
                This file type can't be previewed inline.
              </p>
              
                href={url}
                target="_blank"
                rel="noreferrer"
                className="bg-amber text-ink font-semibold px-4 py-2 rounded-lg inline-block"
              >
                Open receipt
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
