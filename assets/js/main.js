window.onload = function () {
    let editor;
    // setting up the editor
    editor = new EasyMDE({
        // autoDownloadFontAwesome: false,
        element: document.getElementById('editing-area'),
        autofocus: true,
        initialValue: '# Your title\nWrite some content here',
        // placeholder: 'Type your markdown content here and preview the rendered output on the left',

        // toolbar
        toolbar: [
            'bold', 'italic', 'strikethrough', 'heading', 'heading-bigger', 'heading-smaller',
            {
                name: "heading set",
                className: "fa fa-header",
                title: "Heading set",
                children: [
                    {
                        name: "heading-1",
                        action: EasyMDE.toggleHeading1,
                        className: "fa fa-header fa-header-x fa-header-1",
                        title: "Heading 1",
                    },
                    {
                        name: "heading-2",
                        action: EasyMDE.toggleHeading2,
                        className: "fa fa-header fa-header-x fa-header-2",
                        title: "Heading 2",
                    },
                    {
                        name: "heading-3",
                        action: EasyMDE.toggleHeading3,
                        className: "fa fa-header fa-header-x fa-header-3",
                        title: "Heading 3",
                    }
                ]
            }, '|',
            'quote', 'unordered-list', 'ordered-list',
            { name: 'task-list', action: addTaskListExample, className: 'fa fa-check-square', title: 'Task-list' }, '|',
            {
                name: "table",
                action: null,
                className: "fa fa-table draw-table",
                title: "Table",
            },
            'code',
            {
                name: 'multi-line-code-block',
                action: addMultilineCodeBlock,
                className: 'fa fa-code multiline-code-block',
                title: 'Multiline Code-block'
            },
            'link', 'image', '|',
            'preview', 'side-by-side', 'fullscreen', '|',
            {
                name: "help",
                action: null,
                className: "fa fa-question-circle",
                title: "Help",
            }
        ],
        
        promptURLs: true,
        
        sideBySideFullscreen: false,
        renderingConfig: {
            singleLineBreaks: false,
        },
        
        // window alert prompt upon user adding link or image, instead of inserting example content
        // promptURLs: true
    });

    // Post setup actions
    const hideAllPopups = () => {
        document.querySelectorAll('.popup').forEach(el => { el.blur(); el.style.visibility = 'hidden'; })
    }

    // Customized draw table action
    const drawTableMenuButton = document.querySelector('button.table[title="Table"]');
    const drawTableMenu = document.querySelector('#draw-table-popup');
    const drawTableMocked = document.querySelector('#draw-table-popup table.draw-table-mockup');
    const drawTableToggleHeaderSwitcher = drawTableMenu.querySelector('#draw-table-toggle-header');
    const drawTableFirstRow = drawTableMenu.querySelector('table.draw-table-mockup tr:first-child');
    const drawTableApplyButton = drawTableMenu.querySelector('button.apply');
    Popper.createPopper(drawTableMenuButton, drawTableMenu, {
        placement: 'bottom-start',
    }); 
    function drawTable (row, column, options = {}) {
        const { hasHeaderRow } = options;
        let tableStr = '\n\n';
        tableStr = tableStr.concat(new Array(column)
            .fill()
            .reduce((pre, value, index) => `${pre} ${hasHeaderRow ? 'HEADER': 'Column'} ${index + 1} |`, '|'));
        tableStr = tableStr.concat('\n');
        tableStr = tableStr.concat(new Array(column).fill().reduce((pre, value, index) => `${pre} -------- |`, '|'));
        tableStr = tableStr.concat('\n');
        for (let i = 0; i < row; i++) {
            tableStr = tableStr.concat(new Array(column).fill().reduce((pre, value, index) => `${pre}          |`, '|'));
            tableStr = tableStr.concat('\n');
        }
        tableStr = tableStr.concat('\n');
        editor.codemirror.doc.replaceRange(tableStr, editor.codemirror.getCursor());
        editor.codemirror.focus();
    }
    drawTableMenuButton.addEventListener('click', (e) => {
        const visibilityToChange = ['hidden', ''].includes(drawTableMenu.style.visibility) ? 'visible' : 'hidden';
        hideAllPopups();
        e.stopPropagation()
        drawTableMenu.style.visibility = visibilityToChange;
        drawTableMenu.addEventListener('click', (e) => e.stopPropagation());
    })
    drawTableApplyButton.addEventListener('click', () => { editor.codemirror.focus(); drawTableMenu.style.visibility = 'hidden'});
    drawTableToggleHeaderSwitcher.addEventListener('change', (e) => {
        const headers = new Array(...drawTableFirstRow.querySelectorAll('th'));
        const nonHeaders = new Array(...drawTableFirstRow.querySelectorAll('td'));
        headers.forEach(el => el.style.display = drawTableToggleHeaderSwitcher.checked ? 'table-cell' : 'none');
        nonHeaders.forEach(el => el.style.display = drawTableToggleHeaderSwitcher.checked ? 'none' : 'table-cell');
    });

    // table cell click
    const mockedUpTableBody = drawTableMocked.children[0];
    const maxRowCount = mockedUpTableBody.childElementCount;
    const maxColumnCount = mockedUpTableBody.children[1].childElementCount;
    const cellInteraction = (e) => {
        const cell = e.target || e.srcElement, row = cell.parentElement;
        const rowCount = new Array(...mockedUpTableBody.children).indexOf(row) + 1;
        const columnCount = new Array(...row.children).filter(el => el.style.display !=='none').indexOf(cell) + 1;
        switch (e.type) {
            case 'mouseover':
                for (let x = 0; x < maxRowCount; x++) {
                    for (let y = 0; y < maxColumnCount; y++) {
                        const loopingRow = mockedUpTableBody.children[x];
                        const element = loopingRow.children[y];
                        if (x >= rowCount)  element.classList.remove('included');
                        else if (y >= columnCount) element.classList.remove('included');
                        else element.classList.add('included');
                        // for 1st row
                        if (x === 0) {
                            if (y >= columnCount) loopingRow.children[y + maxColumnCount].classList.remove('included');
                            else loopingRow.children[y + maxColumnCount].classList.add('included');
                        }
                    }
                }
                break;
            case 'click':
                console.log(`${rowCount} - ${columnCount}`);
                drawTable(rowCount, columnCount, { hasHeaderRow: drawTableToggleHeaderSwitcher.checked });
                break;
        }
    };
    new Array(...mockedUpTableBody.children).forEach(row => {
        new Array(...row.children).forEach(cell => {
            cell.addEventListener('mouseover', cellInteraction)
            cell.addEventListener('click', cellInteraction)
        })
    })

    /* Other customized actions */
    function addTaskListExample(editor) {
        const content = '\n\n- [ ] task to finish\n- [x] finished task\n\n';
        editor.codemirror.doc.replaceRange(content, editor.codemirror.getCursor());
        editor.codemirror.focus();
    }
    
    function addMultilineCodeBlock(editor) {
        const content = '\n\n\`\`\`\nAdd your codes here\n\`\`\`\n\n';
        editor.codemirror.doc.replaceRange(content, editor.codemirror.getCursor());
        editor.codemirror.focus();
    }

    // Customized guide/help menu
    const guideMenuButton = document.querySelector('button.help[title="Help"]');
    const guideMenu = document.querySelector('#guide-popup');
    Popper.createPopper(guideMenuButton, guideMenu, {
        placement: 'bottom-start',
    }); 
    guideMenuButton.addEventListener('click', (e) => {
        const visibilityToChange = ['hidden', ''].includes(guideMenu.style.visibility) ? 'visible' : 'hidden';
        hideAllPopups();
        e.stopPropagation()
        guideMenu.style.visibility = visibilityToChange;
        guideMenu.addEventListener('click', (e) => e.stopPropagation());
    })
    
    document.addEventListener('click', hideAllPopups);

    // show side-by-side
    editor.toggleSideBySide();

    /* Control panel */
    const session_prefix = btoa('stitch_doc');
    sessionStorage[`${session_prefix}_github-domain`] = 'https://github.com';
    sessionStorage[`${session_prefix}_repository-path`] = 'SmokedSalmon/markdown_editor';
    sessionStorage[`${session_prefix}_branch`] = 'master';
    sessionStorage[`${session_prefix}_file-path`] = 'index.html';
    
    const doneButton = document.getElementById('copy-and-go');
    doneButton.addEventListener('click', () => {
        const githubDomain = sessionStorage[`${session_prefix}_github-domain`];
        const repositoryPath = sessionStorage[`${session_prefix}_repository-path`];
        const branch = sessionStorage[`${session_prefix}_branch`];
        const filePath = sessionStorage[`${session_prefix}_file-path`];
        const newWindow = window.open(`${githubDomain}/${repositoryPath}/edit/${branch}/${filePath}`);
        newWindow.onload = () => {
            newWindow.document.querySelector('input#commit-summary-input').value = 'Update newly edit content';
            const range = newWindow.document.createRange();
            const intervalId = setInterval(() => {
                const codeEditor = newWindow.document.getElementById('code-editor');
                if (!codeEditor) return;
                range.selectNodeContents(codeEditor);
                const sel = newWindow.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
                clearInterval(intervalId);
            }, 100)
        }
    });

    // debug only
    window.editor = editor;
}