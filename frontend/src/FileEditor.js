import React, { useState } from "react";

const FileEditor = ({ content, onSave, onCancel }) => {
  const [editorContent, setEditorContent] = useState(content);

  const handleSave = () => {
    onSave(editorContent);
  };

  return (
    <div className="file-editor">
      <textarea
        value={editorContent}
        onChange={(e) => setEditorContent(e.target.value)}
      />
      <div className="editor-buttons">
        <button onClick={handleSave}>Save</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

export default FileEditor;
