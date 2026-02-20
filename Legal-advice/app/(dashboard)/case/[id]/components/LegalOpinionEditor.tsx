'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Quote,
  Undo,
  Redo,
  Save,
  Send,
  BookOpen,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import ClauseLibraryBrowser from './ClauseLibraryBrowser';

interface Props {
  initialContent?: string | any;
  onSave: (content: any) => void;
  onSend: () => void;
  isSaving?: boolean;
  isSending?: boolean;
  lastSavedAt?: string;
  readOnly?: boolean;
  department?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-200 bg-slate-50 sticky top-0 z-10 rounded-t-xl">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-slate-200 transition-colors ${editor.isActive('bold') ? 'bg-slate-200 text-slate-900' : 'text-slate-600'}`}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-slate-200 transition-colors ${editor.isActive('italic') ? 'bg-slate-200 text-slate-900' : 'text-slate-600'}`}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-2 rounded hover:bg-slate-200 transition-colors ${editor.isActive('underline') ? 'bg-slate-200 text-slate-900' : 'text-slate-600'}`}
        title="Underline"
      >
        <UnderlineIcon className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-slate-300 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-2 rounded hover:bg-slate-200 transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-slate-200 text-slate-900' : 'text-slate-600'}`}
        title="Heading 1"
      >
        <Heading1 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded hover:bg-slate-200 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-200 text-slate-900' : 'text-slate-600'}`}
        title="Heading 2"
      >
        <Heading2 className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-slate-300 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`p-2 rounded hover:bg-slate-200 transition-colors ${editor.isActive({ textAlign: 'left' }) ? 'bg-slate-200 text-slate-900' : 'text-slate-600'}`}
        title="Align Left"
      >
        <AlignLeft className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`p-2 rounded hover:bg-slate-200 transition-colors ${editor.isActive({ textAlign: 'center' }) ? 'bg-slate-200 text-slate-900' : 'text-slate-600'}`}
        title="Align Center"
      >
        <AlignCenter className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`p-2 rounded hover:bg-slate-200 transition-colors ${editor.isActive({ textAlign: 'right' }) ? 'bg-slate-200 text-slate-900' : 'text-slate-600'}`}
        title="Align Right"
      >
        <AlignRight className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        className={`p-2 rounded hover:bg-slate-200 transition-colors ${editor.isActive({ textAlign: 'justify' }) ? 'bg-slate-200 text-slate-900' : 'text-slate-600'}`}
        title="Justify"
      >
        <AlignJustify className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-slate-300 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-slate-200 transition-colors ${editor.isActive('bulletList') ? 'bg-slate-200 text-slate-900' : 'text-slate-600'}`}
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded hover:bg-slate-200 transition-colors ${editor.isActive('orderedList') ? 'bg-slate-200 text-slate-900' : 'text-slate-600'}`}
        title="Numbered List"
      >
        <ListOrdered className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-2 rounded hover:bg-slate-200 transition-colors ${editor.isActive('blockquote') ? 'bg-slate-200 text-slate-900' : 'text-slate-600'}`}
        title="Quote"
      >
        <Quote className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-slate-300 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="p-2 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-50"
        title="Undo"
      >
        <Undo className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="p-2 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-50"
        title="Redo"
      >
        <Redo className="w-4 h-4" />
      </button>
    </div>
  );
};

const MenuBarWithClauseLibrary = ({
  editor,
  onOpenClauseLibrary,
}: {
  editor: any;
  onOpenClauseLibrary: () => void;
}) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-2 border-b border-slate-200 bg-slate-50 sticky top-0 z-10 rounded-t-xl">
      <div className="flex flex-wrap items-center gap-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-slate-200 transition-colors ${editor.isActive('bold') ? 'bg-slate-200 text-slate-900' : 'text-slate-600'}`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-slate-200 transition-colors ${editor.isActive('italic') ? 'bg-slate-200 text-slate-900' : 'text-slate-600'}`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded hover:bg-slate-200 transition-colors ${editor.isActive('underline') ? 'bg-slate-200 text-slate-900' : 'text-slate-600'}`}
          title="Underline"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-slate-300 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded hover:bg-slate-200 transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-slate-200 text-slate-900' : 'text-slate-600'}`}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-slate-200 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-200 text-slate-900' : 'text-slate-600'}`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-slate-300 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-slate-200 transition-colors ${editor.isActive('bulletList') ? 'bg-slate-200 text-slate-900' : 'text-slate-600'}`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-slate-200 transition-colors ${editor.isActive('orderedList') ? 'bg-slate-200 text-slate-900' : 'text-slate-600'}`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-slate-300 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="p-2 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-50"
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="p-2 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-50"
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* Clause Library Button */}
      <button
        type="button"
        onClick={onOpenClauseLibrary}
        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
        title="Insert from Clause Library"
      >
        <BookOpen className="w-4 h-4" />
        Insert from Library
      </button>
    </div>
  );
};

export default function LegalOpinionEditor({
  initialContent,
  onSave,
  onSend,
  isSaving,
  isSending,
  lastSavedAt,
  readOnly = false,
  department,
}: Props) {
  const [_, setForceUpdate] = useState(0);
  const [showClauseLibrary, setShowClauseLibrary] = useState(false);
  const editor = useEditor({
    editable: !readOnly,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: readOnly ? '' : 'Start drafting the legal opinion here...',
      }),
      // Underline, // Removed to fix duplicate extension warning
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: initialContent || '',
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none focus:outline-none min-h-[500px] p-8 bg-white',
      },
    },
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      // Can implement debounce here or in parent
      // For now, let's trigger save via button manually or auto-save in useEffect in parent
      const json = editor.getJSON();
      setForceUpdate((prev) => prev + 1);
    },
    onSelectionUpdate: () => {
      setForceUpdate((prev) => prev + 1);
    },
    onTransaction: () => {
      setForceUpdate((prev) => prev + 1);
    },
  });

  // Update editable state if readOnly changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(!readOnly);
    }
  }, [readOnly, editor]);

  // Update content if initialContent changes (e.g. loaded from DB)
  useEffect(() => {
    if (editor && initialContent) {
      // Only set content if editor is empty or forced update.
      // Be careful not to overwrite user input.
      // Better to assume initialContent is only for first load.
      if (editor.isEmpty) {
        editor.commands.setContent(initialContent);
      }
    }
  }, [initialContent, editor]);

  const handleInsertClause = (content: string, clauseId: string) => {
    if (editor) {
      editor.chain().focus().insertContent(`<p>${content}</p>`).run();
      // Track clause usage in database if needed
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full ${readOnly ? 'border-none shadow-none' : ''}`}
    >
      {!readOnly && (
        <MenuBarWithClauseLibrary
          editor={editor}
          onOpenClauseLibrary={() => setShowClauseLibrary(true)}
        />
      )}

      {/* Clause Library Modal */}
      {
  showClauseLibrary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Clause Library</h2>
              <button
                onClick={() => setShowClauseLibrary(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ClauseLibraryBrowser
                onInsert={(content, id) => {
                  handleInsertClause(content, id);
                  setShowClauseLibrary(false);
                }}
                department={department}
              />
            </div>
          </div>
        </div>
      )}

      <div
        className={`flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-8 ${readOnly ? '!bg-white !p-0' : ''}`}
      >
        <div
          className={`max-w-[210mm] mx-auto bg-white shadow-lg min-h-[297mm] ${readOnly ? '!shadow-none !min-h-0' : ''}`}
        >
          <EditorContent editor={editor} />
        </div>
      </div>

      {!readOnly && (
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            {lastSavedAt ? `Last saved ${lastSavedAt}` : 'Unsaved changes'}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => onSave(editor.getJSON())}
              disabled={isSaving}
              className="px-4 py-2 text-slate-700 bg-white border border-slate-200 font-medium rounded-lg hover:bg-slate-50 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={onSend}
              disabled={isSending}
              className="px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {isSending ? 'Sending...' : 'Send to Client'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
