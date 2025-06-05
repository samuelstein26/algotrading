import React, { useEffect, useState, useRef, useImperativeHandle } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './css/PostCardEditor.css';

const PostCardEditor = React.forwardRef(({ initialContent }, ref) => {
    const [delta, setDelta] = useState(null);
    const quillRef = useRef(null);
    const editorRef = useRef(null);

    // Expõe métodos para o componente pai
    useImperativeHandle(ref, () => ({
        getDelta: () => delta,
        getEditor: () => editorRef.current,
        clear: () => {
            setDelta({ ops: [] });
            if (editorRef.current) {
                editorRef.current.setContents({ ops: [] });
            }
        }
    }));

    // Inicializa o editor com o conteúdo fornecido
    useEffect(() => {
        if (quillRef.current) {
            const editor = quillRef.current.getEditor();
            editorRef.current = editor;

            if (initialContent) {
                try {
                    // Assume que initialContent já é um objeto Delta válido
                    const content = typeof initialContent === 'string' 
                        ? JSON.parse(initialContent) 
                        : initialContent;
                    
                    editor.setContents(content);
                    setDelta(content);
                } catch (e) {
                    console.error("Erro ao analisar o conteúdo inicial:", e);
                    editor.setContents({ ops: [] });
                    setDelta({ ops: [] });
                }
            }
        }
    }, [initialContent]);

    const handleChange = (content, delta, source, editor) => {
        if (source === 'user') {
            const currentContents = editor.getContents();
            setDelta(currentContents);
        }
    };

    const modules = {
        toolbar: {
            container: [
                [{ 'header': [1, 2, false] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['image'],
            ]
        }
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet',
        'link', 'image'
    ];

    return (
        <div className="post-card-editor-container">
            <ReactQuill
                ref={quillRef}
                theme="snow"
                value={delta}
                onChange={handleChange}
                modules={modules}
                formats={formats}
                className="post-card-editor"
            />
        </div>
    );
});

export default PostCardEditor;