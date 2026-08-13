"use client";

import { useEffect } from "react";
import { useEditor, EditorContent, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Undo2,
  Redo2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type ToolbarButtonProps = {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

function ToolbarButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={cn(
        "flex h-8 w-8 items-center justify-center border border-stone-900 bg-white text-stone-900 transition-colors hover:bg-stone-100 disabled:opacity-40",
        active && "bg-stone-900 text-yellow-500 hover:bg-stone-900",
      )}
    >
      {children}
    </button>
  );
}

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

export function RichTextEditor({
  value,
  onChange,
  placeholder,
}: RichTextEditorProps) {
  const t = useTranslations("admin.products");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty",
        emptyNodeClass: "is-empty",
      }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor: instance }) => {
      onChange(instance.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (current !== value) {
      editor.commands.setContent(value || "");
    }
  }, [editor, value]);

  const toolbar = useEditorState({
    editor,
    selector: (ctx) => {
      const instance = ctx.editor;
      if (!instance) {
        return {
          bold: false,
          italic: false,
          underline: false,
          strike: false,
          h1: false,
          h2: false,
          h3: false,
          bulletList: false,
          orderedList: false,
          blockquote: false,
          link: false,
          canUndo: false,
          canRedo: false,
        };
      }
      return {
        bold: instance.isActive("bold"),
        italic: instance.isActive("italic"),
        underline: instance.isActive("underline"),
        strike: instance.isActive("strike"),
        h1: instance.isActive("heading", { level: 1 }),
        h2: instance.isActive("heading", { level: 2 }),
        h3: instance.isActive("heading", { level: 3 }),
        bulletList: instance.isActive("bulletList"),
        orderedList: instance.isActive("orderedList"),
        blockquote: instance.isActive("blockquote"),
        link: instance.isActive("link"),
        canUndo: instance.can().undo(),
        canRedo: instance.can().redo(),
      };
    },
  });

  if (!editor) {
    return (
      <div className="min-h-[200px] rounded-none border border-stone-900 bg-white" />
    );
  }

  const chain = () => editor.chain().focus();

  function handleLink() {
    if (!editor) return;
    if (editor.isActive("link")) {
      chain().unsetLink().run();
      return;
    }
    const url = window.prompt("URL", "https://");
    if (url) {
      try {
        chain().toggleLink({ href: url }).run();
      } catch {
        // invalid url — ignore
      }
    }
  }

  return (
    <div className="rounded-none border border-stone-900 bg-white">
      <div className="flex flex-wrap items-center gap-1 border-b border-stone-900 bg-stone-50 p-2">
        <ToolbarButton
          label={t("editorBold")}
          active={toolbar?.bold}
          onClick={() => chain().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label={t("editorItalic")}
          active={toolbar?.italic}
          onClick={() => chain().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label={t("editorUnderline")}
          active={toolbar?.underline}
          onClick={() => chain().toggleUnderline().run()}
        >
          <Underline className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label={t("editorStrike")}
          active={toolbar?.strike}
          onClick={() => chain().toggleStrike().run()}
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <span className="mx-1 h-6 w-px bg-stone-900" />
        <ToolbarButton
          label={t("editorH1")}
          active={toolbar?.h1}
          onClick={() => chain().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label={t("editorH2")}
          active={toolbar?.h2}
          onClick={() => chain().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label={t("editorH3")}
          active={toolbar?.h3}
          onClick={() => chain().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
        <span className="mx-1 h-6 w-px bg-stone-900" />
        <ToolbarButton
          label={t("editorBulletList")}
          active={toolbar?.bulletList}
          onClick={() => chain().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label={t("editorOrderedList")}
          active={toolbar?.orderedList}
          onClick={() => chain().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label={t("editorBlockquote")}
          active={toolbar?.blockquote}
          onClick={() => chain().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label={t("editorLink")}
          active={toolbar?.link}
          onClick={handleLink}
        >
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
        <span className="mx-1 h-6 w-px bg-stone-900" />
        <ToolbarButton
          label={t("editorUndo")}
          disabled={!toolbar?.canUndo}
          onClick={() => chain().undo().run()}
        >
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label={t("editorRedo")}
          disabled={!toolbar?.canRedo}
          onClick={() => chain().redo().run()}
        >
          <Redo2 className="h-4 w-4" />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} className="rte-content" />
    </div>
  );
}
