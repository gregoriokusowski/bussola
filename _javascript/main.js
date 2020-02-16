import * as ace from 'brace';
import 'brace/mode/yaml';

const editor = ace.edit('editor', {
    mode: 'ace/mode/yaml',
    selectionStyle: 'text'
})
