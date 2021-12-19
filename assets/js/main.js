window.onload = function () {
    const easyMDE = new EasyMDE({
        element: document.getElementById('editing-area'),
        autofocus: true,
        placeholder: 'Type your markdown content here',

        // toolbar
        toolbar: [
            'bold', 'italic', 'heading', '|',
            'quote', 'unordered-list', 'ordered-list', '|',
            'table', 'link', 'image', '|',
            'preview', 'side-by-side', 'fullscreen', '|',
            'guide'
        ],

        renderingConfig: {
            singleLineBreaks: false,
        },
        
        // window alert prompt upon user adding link or image, instead of inserting example content
        // promptURLs: true
    });
}