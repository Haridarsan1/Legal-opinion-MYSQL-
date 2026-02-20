import { Upload, FileText, CheckCircle } from 'lucide-react';

export default function BankUploadPage() {
  return (
    <div className="flex flex-col flex-1 p-8 gap-8 max-w-[1400px] mx-auto w-full">
      {/* Page Heading */}
      <div className="flex flex-col gap-1">
        <h1 className="text-slate-900 text-3xl font-extrabold tracking-tight">
          Upload Property Files
        </h1>
        <p className="text-slate-500 text-base">
          Upload property documents for legal opinion verification
        </p>
      </div>

      {/* Upload Form Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
        {/* Property Details */}
        <div className="mb-8">
          <h2 className="text-slate-900 text-xl font-bold mb-4">Property Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Property ID</label>
              <input
                type="text"
                className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 focus:border-primary focus:ring-primary"
                placeholder="e.g., PROP-2024-001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Loan Application ID
              </label>
              <input
                type="text"
                className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 focus:border-primary focus:ring-primary"
                placeholder="e.g., LA-2024-12345"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Property Address
              </label>
              <input
                type="text"
                className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 focus:border-primary focus:ring-primary"
                placeholder="Complete property address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Property Type</label>
              <select className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 focus:border-primary focus:ring-primary cursor-pointer">
                <option>Residential</option>
                <option>Commercial</option>
                <option>Agricultural</option>
                <option>Industrial</option>
              </select>
            </div>
          </div>
        </div>

        {/* Document Upload Section */}
        <div className="mb-8">
          <h2 className="text-slate-900 text-xl font-bold mb-4">Required Documents</h2>

          {/* Upload Zone */}
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-primary hover:bg-blue-50/50 transition-colors cursor-pointer">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <Upload className="size-8 text-primary" />
              </div>
              <div>
                <p className="text-slate-900 font-bold mb-1">
                  Drag and drop files here, or click to browse
                </p>
                <p className="text-slate-500 text-sm">
                  Supported formats: PDF, JPG, PNG (Max 10MB each)
                </p>
              </div>
              <button className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg font-bold transition-colors">
                Select Files
              </button>
            </div>
          </div>

          {/* Document Checklist */}
          <div className="mt-6 bg-slate-50 rounded-xl p-6">
            <h3 className="text-slate-900 font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">task_alt</span>
              Document Checklist
            </h3>
            <div className="space-y-3">
              {[
                'Title Deed / Sale Deed',
                'Encumbrance Certificate',
                'Property Tax Receipts (Last 3 years)',
                'Approved Building Plan',
                'Completion Certificate',
                'NOC from Society/Builder',
                'Chain of Title Documents',
                'Survey Documents',
              ].map((doc, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="size-5 rounded border-2 border-slate-300 flex items-center justify-center bg-white">
                    {/* Empty checkbox */}
                  </div>
                  <span className="text-slate-700 text-sm">{doc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Uploaded Files List (Example) */}
        <div className="mb-8">
          <h3 className="text-slate-900 font-bold mb-4">Uploaded Files (2)</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg text-green-600">
                  <FileText className="size-5" />
                </div>
                <div>
                  <p className="text-slate-900 font-medium text-sm">title_deed.pdf</p>
                  <p className="text-slate-500 text-xs">2.4 MB • Uploaded just now</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="size-5 text-green-600" />
                <button className="text-slate-400 hover:text-danger transition-colors">
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg text-green-600">
                  <FileText className="size-5" />
                </div>
                <div>
                  <p className="text-slate-900 font-medium text-sm">encumbrance_certificate.pdf</p>
                  <p className="text-slate-500 text-xs">1.8 MB • Uploaded just now</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="size-5 text-green-600" />
                <button className="text-slate-400 hover:text-danger transition-colors">
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 focus:border-primary focus:ring-primary"
            rows={4}
            placeholder="Any specific instructions or concerns about the property..."
          ></textarea>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          <button className="px-6 py-2.5 border border-slate-200 rounded-lg text-slate-700 font-bold hover:bg-slate-50 transition-colors">
            Save as Draft
          </button>
          <div className="flex gap-3">
            <button className="px-6 py-2.5 border border-slate-200 rounded-lg text-slate-700 font-bold hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold transition-colors shadow-lg shadow-primary/20">
              Submit for Review
            </button>
          </div>
        </div>
      </div>

      {/* Info Alert */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-100 rounded-lg text-primary flex-shrink-0">
            <span className="material-symbols-outlined">info</span>
          </div>
          <div className="flex-1">
            <h3 className="text-slate-900 font-bold mb-2">Review Process</h3>
            <p className="text-slate-600 text-sm mb-4">
              Once you submit the documents, our legal team will review them within your selected
              SLA period. You'll receive real-time updates on the verification status and any
              clarifications needed.
            </p>
            <ul className="text-slate-600 text-sm space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle className="size-4 text-green-600" />
                All documents are encrypted and stored securely
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="size-4 text-green-600" />
                Automated document verification for faster processing
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="size-4 text-green-600" />
                Verified by experienced property law experts
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
