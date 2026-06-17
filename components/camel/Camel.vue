<template>
    <div class="converter-wrapper">
        <div class="converter-header">
            <h1 class="gradient-title">테이블 컬럼 카멜 표기법 변환기</h1>
            <p class="description-text">Underscore Notation으로 표기된 테이블 컬럼명을 Camel Notation으로 변환된 자바 필드명으로 간편하게 생성할 수 있습니다.</p>
        </div>

        <form name="conf">
            <div class="glass-card config-card">
                <div class="card-header-custom">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="icon-gear" viewBox="0 0 16 16">
                        <path d="M9.405 1.02c-.252-.772-1.353-.772-1.605 0a1.18 1.18 0 0 1-1.885.733c-.636-.452-1.503.204-1.22 1.02a1.18 1.18 0 0 1-.77 1.488c-.77.253-.77 1.353 0 1.605a1.18 1.18 0 0 1 .77 1.489c-.283.816.584 1.472 1.22 1.02a1.18 1.18 0 0 1 1.885.733c.252.772 1.353.772 1.605 0a1.18 1.18 0 0 1 1.885-.733c.636.452 1.503-.204 1.22-1.02a1.18 1.18 0 0 1 .77-1.488c.77-.253.77-1.353 0-1.605a1.18 1.18 0 0 1-.77-1.489c.283-.816-.584-1.472-1.22-1.02a1.18 1.18 0 0 1-1.885-.733zM8 10a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/>
                    </svg>
                    <h2>Configurations</h2>
                </div>

                <div class="config-group">
                    <span class="group-label">Conversion Style</span>
                    <div class="radio-chips">
                        <label class="chip" :class="{ active: checked === 'code_vo' }">
                            <input id="code_vo" type="radio" value="code_vo" v-model="checked" @change="convert()" class="sr-only"/>
                            VO & DTO
                        </label>
                        <label class="chip" :class="{ active: checked === 'code_basic' }">
                            <input id="code_basic" type="radio" value="code_basic" v-model="checked" @change="convert()" class="sr-only"/>
                            Basic
                        </label>
                        <label class="chip" :class="{ active: checked === 'code_resultmap' }">
                            <input id="code_resultmap" type="radio" value="code_resultmap" v-model="checked" @change="convert()" class="sr-only"/>
                            ResultMap
                        </label>
                        <label class="chip" :class="{ active: checked === 'code_select' }">
                            <input id="code_select" type="radio" value="code_select" v-model="checked" @change="convert()" class="sr-only"/>
                            Select
                        </label>
                        <label class="chip" :class="{ active: checked === 'code_insert' }">
                            <input id="code_insert" type="radio" value="code_insert" v-model="checked" @change="convert()" class="sr-only"/>
                            Insert
                        </label>
                        <label class="chip" :class="{ active: checked === 'code_update' }">
                            <input id="code_update" type="radio" value="code_update" v-model="checked" @change="convert()" class="sr-only"/>
                            Update
                        </label>
                        <label class="chip" :class="{ active: checked === 'code_delete' }">
                            <input id="code_delete" type="radio" value="code_delete" v-model="checked" @change="convert()" class="sr-only"/>
                            Delete
                        </label>
                        <label class="chip" :class="{ active: checked === 'code_queryStr' }">
                            <input id="code_queryStr" type="radio" value="code_queryStr" v-model="checked" @change="convert()" class="sr-only"/>
                            캬
                        </label>
                    </div>
                </div>

                <div id="options">
                    <div v-show="voOptions">
                        <div v-show="modifierDatatype" class="select-group">
                            <div class="select-field">
                                <label for="modifier">Modifier</label>
                                <select id="modifier" @change="convert()" v-model="modifierOptions" class="custom-select">
                                    <option>public</option>
                                    <option>protected</option>
                                    <option>private</option>
                                </select>
                            </div>
                            <div class="select-field">
                                <label for="datatype">Data Type</label>
                                <select id="datatype" @change="convert()" v-model="datatypeOptions" class="custom-select">
                                    <option>int</option>
                                    <option>long</option>
                                    <option>float</option>
                                    <option>double</option>
                                    <option>byte[]</option>
                                    <option>boolean</option>
                                    <option>char</option>
                                    <option>String</option>
                                </select>
                            </div>
                        </div>

                        <div class="config-group mt-3">
                            <span class="group-label">Annotation</span>
                            <div class="radio-chips small-chips">
                                <label class="chip" :class="{ active: annotationCheck === 'schema' }">
                                    <input type="radio" id="schema" @change="convert(); modifierDatatype = false;" v-model="annotationCheck" value="schema" class="sr-only"/>
                                    @Schema
                                </label>
                                <label class="chip" :class="{ active: annotationCheck === 'column' }">
                                    <input type="radio" id="column" @change="convert(); modifierDatatype = true;" v-model="annotationCheck" value="column" class="sr-only"/>
                                    @Column
                                </label>
                            </div>
                        </div>

                        <div class="checkbox-switches">
                            <label class="switch-container">
                                <input type="checkbox" id="package" name="package" @click="createPackage()" v-model="checkBoxDisplay" class="custom-switch-input" />
                                <span class="custom-switch-slider"></span>
                                <span class="switch-label">createPackage</span>
                            </label>
                            <label class="switch-container">
                                <input type="checkbox" id="jsonproperty" @change="convert()" v-model="jsonpropertyCheck" value="jsonproperty" class="custom-switch-input" />
                                <span class="custom-switch-slider"></span>
                                <span class="switch-label">@JsonProperty</span>
                            </label>
                        </div>

                        <div v-show="checkBoxDisplay" class="input-details-group">
                            <div class="input-field">
                                <label for="ClassName">ClassName</label>
                                <input id="ClassName" type="text" name="ClassName" :value="inputData.class" @keyup="to => { inputData.class = (to.target as HTMLInputElement).value; handleChange(); }" placeholder="ApiBodyDTO" />
                            </div>
                            <div class="input-field">
                                <label for="PackageName">PackageName</label>
                                <input id="PackageName" type="text" name="PackageName" :value="inputData.package" @keyup="to => { inputData.package = (to.target as HTMLInputElement).value; handleChange(); }" placeholder="com.app.common.dto" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <div v-show="resultmapOptions" class="input-details-group">
                            <div class="input-field">
                                <label for="_id">ResultMap ID</label>
                                <input id="_id" type="text" name="_id" @keyup="convert();" value="" placeholder="id" />
                            </div>
                            <div class="input-field">
                                <label for="_class">Class Type</label>
                                <input id="_class" type="text" name="_class" @keyup="convert();" value="" placeholder="class" />
                            </div>
                        </div>
                        <div v-show="tableOptions" class="input-details-group">
                            <div class="input-field">
                                <label for="table">Table Name</label>
                                <input id="table" type="text" name="table" @keyup="convert()" value="" placeholder="TABLE_NAME" />
                            </div>
                            <div class="input-field">
                                <label for="as">Table Alias (AS)</label>
                                <input id="as" type="text" name="as" @keyup="convert()" value="" placeholder="alias" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>

        <div id="basicDiv" class="editor-grid">
            <div class="editor-card">
                <div class="editor-header">
                    <span>Underscore Input</span>
                </div>
                <textarea class="code-textarea camel" @keyup="convert()" v-model="input" placeholder="USER_ID&#10;ADDR_HOME_STREET&#10;YOU_LOVE_ME_SO_MUCH"></textarea>
            </div>
            <div class="editor-card">
                <div class="editor-header">
                    <span>Camel Output</span>
                    <button class="btn-copy-floating" @click.prevent="copyOutput">Copy</button>
                </div>
                <pre class="code-textarea camel output-area" v-html="highlightedCode"></pre>
            </div>
        </div>

        <div id="schemaDiv" class="schema-layout">
            <div class="download-bar">
                <downBt @click="genFile" />
            </div>
            <div class="editor-columns">
                <div class="editor-card">
                    <div class="editor-header">Column</div>
                    <textarea class="code-textarea camel-schema-tex" @keyup="convert()" v-model="input"></textarea>
                </div>
                <div class="editor-card">
                    <div class="editor-header">Type</div>
                    <textarea class="code-textarea camel-schema-tex" @keyup="convert()" v-model="inputType"></textarea>
                </div>
                <div class="editor-card">
                    <div class="editor-header">Comment</div>
                    <textarea class="code-textarea camel-schema-tex" @keyup="convert()" v-model="inputComment"></textarea>
                </div>
            </div>
            <div class="editor-card output-card-large">
                <div class="editor-header">
                    <span>Generated Java DTO/VO Code</span>
                    <button class="btn-copy-floating" @click.prevent="copyOutput">Copy</button>
                </div>
                <pre class="code-textarea output-area-large" v-html="highlightedCode"></pre>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">

import { onMounted, ref, computed, reactive, watch, nextTick } from 'vue';
import { camelStore } from "~/stores/camel";
import downBt from "~/components/button/downBt.vue";

// HTML escaping helper
function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// Single-pass syntax highlighter
function highlight(code: string, language: string): string {
    if (!code) return '';
    const escaped = escapeHtml(code);
    
    if (language === 'java') {
        const javaRegex = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("[^"\\]*(?:\\.[^"\\]*)*")|(@\w+)|(\b(?:package|import|public|private|protected|class|interface|extends|implements|void|int|long|float|double|byte|boolean|char|String|Integer|Long|Float|Double|Boolean|Character|LocalDateTime|LocalDate|new|return|null|true|false)\b)/g;
        return escaped.replace(javaRegex, (match, p1, p2, p3, p4) => {
            if (p1) return `<span class="token-comment">${p1}</span>`;
            if (p2) return `<span class="token-string">${p2}</span>`;
            if (p3) return `<span class="token-annotation">${p3}</span>`;
            if (p4) return `<span class="token-keyword">${p4}</span>`;
            return match;
        });
    }
    
    if (language === 'xml') {
        const xmlRegex = /(&lt;\/?[a-zA-Z0-9_:-]+)|(\b[a-zA-Z0-9_:-]+)(?=\s*=)|("[^"]*")/g;
        return escaped.replace(xmlRegex, (match, p1, p2, p3) => {
            if (p1) {
                if (p1.startsWith('&lt;/')) {
                    return `&lt;/<span class="token-tag">${p1.substring(5)}</span>`;
                }
                return `&lt;<span class="token-tag">${p1.substring(4)}</span>`;
            }
            if (p2) return `<span class="token-attr-name">${p2}</span>`;
            if (p3) return `<span class="token-attr-value">${p3}</span>`;
            return match;
        });
    }
    
    if (language === 'sql') {
        const sqlRegex = /(--[^\n]*)|('[^'\\]*(?:\\.[^'\\]*)*')|(#\{[a-zA-Z0-9_]+\})|(\b(?:SELECT|FROM|WHERE|AND|OR|INSERT|INTO|VALUES|UPDATE|SET|DELETE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|GROUP|BY|ORDER|AS)\b)/gi;
        return escaped.replace(sqlRegex, (match, p1, p2, p3, p4) => {
            if (p1) return `<span class="token-comment">${p1}</span>`;
            if (p2) return `<span class="token-string">${p2}</span>`;
            if (p3) return `<span class="token-variable">${p3}</span>`;
            if (p4) return `<span class="token-keyword">${p4.toUpperCase()}</span>`;
            return match;
        });
    }
    
    // Generic
    const genericRegex = /('[^'\\]*(?:\\.[^'\\]*)*')|("[^"\\]*(?:\\.[^"\\]*)*")/g;
    return escaped.replace(genericRegex, (match, p1, p2) => {
        if (p1 || p2) return `<span class="token-string">${match}</span>`;
        return match;
    });
}


const store = camelStore();

/**
 * 파일 다운
 */
const genFile = async () => {
    store.data.camelStr = output.value;
    store.data.fileNm = inputData.class.concat('.java')

    // const result = await store.genFile();
    
    const url = window.URL.createObjectURL(new Blob([output.value]));
    const link = document.createElement('a');

    link.href = url;
    link.setAttribute('download', store.data.fileNm); // 다운로드될 파일의 이름과 확장자를 지정합니다.
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

const copyOutput = () => {
    if (!output.value) return;
    navigator.clipboard.writeText(output.value).then(() => {
        alert('변환된 결과가 클립보드에 복사되었습니다.');
    }).catch(err => {
        alert('클립보드 복사에 실패했습니다: ' + err);
    });
}

// default data
const input = ref('USER_ID\nADDR_HOME_STREET\nYOU_LOVE_ME_SO_MUCH\n');
const output = ref();

const highlightedCode = computed(() => {
    const code = output.value || '';
    const mode = checked.value;
    if (mode === 'code_vo' || mode === 'code_basic') {
        return highlight(code, 'java');
    } else if (mode === 'code_resultmap') {
        return highlight(code, 'xml');
    } else if (mode === 'code_select' || mode === 'code_insert' || mode === 'code_update' || mode === 'code_delete') {
        return highlight(code, 'sql');
    } else {
        return highlight(code, 'generic');
    }
});

// schema data
const inputType = ref('BIGINT\nVARCHAR\nDOUBLE\n');
const inputComment = ref('회원ID\n주소\n사룽해요\n');

// default option
const checked = ref('code_vo');
const modifierOptions = ref('private');
const datatypeOptions = ref('String');

const inputData = reactive({
    class: 'ApiBodyDTO',
    package: 'com.app.common.dto'
});

const annotationCheck = ref('schema');
const checkBoxDisplay = ref(false);
const jsonpropertyCheck = ref(false);
const modifierDatatype = ref(false);

const voOptions = ref(false);
const resultmapOptions = ref(false);
const tableOptions = ref(false);

onMounted(() => {
    convert();
})

watch(
    () => checked.value, 
    async (newVal, oldVal) => {
  if ('code_vo' === newVal) {
    nextTick(() => {
        annotationCheck.value = 'schema'
        modifierDatatype.value = false
    })
  }
})

function convert() {
    let count = 0;
    let output1 = '';
    let output2 = '';
    let basicDiv = document.getElementById('basicDiv');
    let schemaDiv = document.getElementById('schemaDiv');
    if (basicDiv) {
        basicDiv.style.cssText = '';
    }
    if (schemaDiv) {
        schemaDiv.style.cssText = 'display:none';
    }

    voOptions.value = false;
    resultmapOptions.value = false;
    tableOptions.value = false;


    const linesType = inputType.value?.split(/\n/);
    const linesComment = inputComment.value?.split(/\n/);

    const lines = input.value.split(/\n/);
    
    for(let i = 0, maxi = lines.length; i < maxi; i++) {
        let before = lines[i];

        if (0 < before.indexOf("_")) {
            before = before.toLowerCase().trim();
        }

        // skip empty lines
        if(before == '') {
            continue;
        }

        // conversion
        let after = before.replace(/_(\w)/g, function(word: string) {
            return word.toUpperCase();
        });
        
        after = after.replace(/_/g, "");
        // console.log('\t' + before + ' ->> ' + after);

        // make result for each
        if('code_basic' === checked.value) {
            output1 += (after + '\n');
        } else if('code_vo' === checked.value) {
            voOptions.value = true;

            // Value Object
            const modifier = modifierOptions.value;
            const datatype = datatypeOptions.value;

            // @Annotation(position = 1, value = "**상품제공정보고시 품목 번호 **")
            if('column' === annotationCheck.value) {
                output1 += ('@Column(name = "' + before + '")\n' + modifier + ' ' + datatype + ' ' + after + ';\n\n');
                // output1 += (modifier + ' ' + datatype + ' ' + after + ';' + '\n');
            } else if ('schema' === annotationCheck.value) {
                if (basicDiv) {
                    basicDiv.style.cssText = 'display:none';
                }
                if (schemaDiv) {
                    schemaDiv.style.cssText = '';
                }

                output1 += jsonpropertyCheck.value ? bar(`@JsonProperty("${lines[i]}")`) : "";
                output1 += ('@Schema(description = "' + convertComment(linesComment, i) + '", example = "")\n' + modifier + ' ' + (linesType ? convertType(linesType, i) : datatype) + ' ' + after + ';\n\n');
            } else {
                output1 += (modifier + ' ' + datatype + ' ' + after + ';\n');
            }
        } else if('code_resultmap' === checked.value) {
            resultmapOptions.value = true;

            // ResultMap
            output1 += ('\t<result property="' + after + '" column="' + before + '" />\n');
        } else if('code_select' === checked.value) {
            tableOptions.value = true;

            // Select
            if(count == 0) {
                output1 += getTableAlias(false) + (before.toUpperCase());
            } else {
                output1 += ('\n     , ' + getTableAlias(false) + before.toUpperCase());
            }

            if(count == 0) {
                output2 += getTableAlias(false) + (before.toUpperCase() + ' = #{' + after + '}\n');
            } else {
                output2 += ('   AND ' + getTableAlias(false) + before.toUpperCase() + ' = #{' + after + '}\n');
            }
        } else if('code_insert' === checked.value) {
            tableOptions.value = true;

            // Insert
            if(count == 0) {
                output1 += '     ' + getTableAlias(false) + (before.toUpperCase());
            } else {
                output1 += ('\n          , ' + getTableAlias(false) + before.toUpperCase());
            }

            if(count == 0) {
                output2 += ('   #{' + after + '}');
            } else {
                output2 += ('\n          , #{' + after + '}');
            }
        } else if('code_update' === checked.value) {
            tableOptions.value = true;

            // Update
            if(count == 0) {
                output1 += getTableAlias(false) + (before.toUpperCase() + ' = #{' + after + '}');
            } else {
                output1 += ('\n     , ' + getTableAlias(false) + before.toUpperCase() + ' = #{' + after + '}');
            }

            if(count == 0) {
                output2 += getTableAlias(false) + (before.toUpperCase() + ' = #{' + after + '}\n');
            } else {
                output2 += ('   AND ' + getTableAlias(false) + before.toUpperCase() + ' = #{' + after + '}\n');
            }
        } else if('code_delete' === checked.value) {
            tableOptions.value = true;

            // Delete
            if(count == 0) {
                output1 += getTableAlias(false) + (before.toUpperCase() + ' = #{' + after + '}\n');
            } else {
                output1 += ('   AND ' + getTableAlias(false) + before.toUpperCase() + ' = #{' + after + '}\n');
            }
        } else if('code_queryStr' === checked.value) {
            // queryStr
            output1 += lines[i].trim() + '\n';
        } else {
            output1 += (after + '\n');
        }
        
        count++;
    }

    if('code_basic' === checked.value) {
        output.value = output1;
    } else if('code_vo' === checked.value) {
        output.value = output1;

        //createPackage 체크 상태일시
        if (checkBoxDisplay.value) handleChange()
    } else if('code_resultmap' === checked.value) {
        output.value = '<resultMap id="' + (document as any).conf._id.value + '" class="' + (document as any).conf._class.value + '">\n';
        output.value += output1;
        output.value += '</resultMap>';
    } else if('code_select' === checked.value) {
        output.value = 'SELECT ';
        output.value += output1 + '\n';
        output.value += '  FROM ' + getTableName() + ' ' + getTableAlias(true) + ' \n';
        output.value += ' WHERE ';
        output.value += output2;
    } else if('code_insert' === checked.value) {
        output.value = 'INSERT INTO ' + getTableName() + ' ' + getTableAlias(true) + '\n' + '     ( ' + output1 + '\n     ) ';
        output.value += 'VALUES (\n         ' + output2 + ')';
    } else if('code_update' === checked.value) {
        output.value = 'UPDATE ' + getTableName() + ' ' + getTableAlias(true) + ' \n';
        output.value += '   SET ' + output1 + '\n';
        output.value += ' WHERE ';
        output.value += output2;
    } else if('code_delete' === checked.value) {
        output.value = 'DELETE \n  FROM ' + getTableName() + ' ' + getTableAlias(true) + ' \n';
        output.value += ' WHERE ';
        output.value += output1;
    } else if('code_queryStr' === checked.value) {
        const unique = [...new Set(
        output1
            .split('\n')
            .map(v => v.trim())
            .filter(Boolean)
    )];

    output.value = unique
        .map((v, i) => (i === 0 ? `'${v}'` : `,'${v}'`))
        .join('\n');
    }

    spaceReplace(checked.value);
    
}

function getTableName() {
    let tableName = (document as any).conf.table.value;
    
    if(!tableName) {
        tableName = 'TABLE_NAME';
    }
    return tableName;
}

function getTableAlias(flg: boolean) {
    let alias = '';

    if ((document as any).conf.as.value) {
        alias = `${(document as any).conf.as.value}${'.'}`;
    }

    return flg ? (document as any).conf.as.value : alias;
}

function spaceReplace(key: String) {
    if('code_basic' === key || 'code_queryStr' === key) {
        output.value = output.value.replaceAll(' ', '');
    }
}

/** 
 * db Type > java Type
 * @param linesType 
 * @param i 
 */
const convertType = (linesType: Array<string>, i: number) => {
    const typeMap = new Map([
        ['BIGINT', 'Long'],
        ['INT', 'Integer'],
        ['INTEGER', 'Integer'],
        ['DOUBLE', 'Double'],
        ['DATETIME', 'LocalDateTime'],
        ['DATE', 'LocalDate']
    ]);
    
    const sanitizedType = linesType[i]?.replace(/[^A-Za-z]/g, '').toUpperCase();
    
    return typeMap.get(sanitizedType) || 'String';
};

const convertComment = (linesType: Array<string>, i: number) => {
    let returnVal = '';

    if (linesType && linesType[i]) {
        returnVal = linesType[i];

    }
    return returnVal;
}

const items = ref([
    { id: 1, name: 'Item 1', imageUrl: '' },
    { id: 2, name: 'Item 2', imageUrl: '' },
]);

const handleFileUpload = (index: number, event: any) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
        items.value[index].imageUrl = reader.result as string || '';
    };
    reader.readAsDataURL(file);
};

/**
 * dto 패키지 생성 함수
 */
const createPackage = async () => {
    checkBoxDisplay.value = checkBoxDisplay.value
    
    const strArray = new Array()
    
    if (!checkBoxDisplay.value) {
        strArray.push(bar(`package ${inputData.package};`, 2))

        if (jsonpropertyCheck.value) {
            strArray.push(bar('import com.fasterxml.jackson.annotation.JsonProperty;'))
        }

        strArray.push(bar('import io.swagger.v3.oas.annotations.media.Schema;'))
        strArray.push(bar('import lombok.AccessLevel;'))
        strArray.push(bar('import lombok.Builder;'))
        strArray.push(bar('import lombok.Getter;'))
        strArray.push(bar('import lombok.Setter;'))
        strArray.push(bar('import lombok.AllArgsConstructor;'))
        strArray.push(bar('import lombok.NoArgsConstructor;'))
        strArray.push(bar('import lombok.ToString;', 2))
        
        
        strArray.push(bar('@Getter'))
        strArray.push(bar('@Setter'))
        strArray.push(bar('@Builder'))
        strArray.push(bar('@ToString'))
        strArray.push(bar('@AllArgsConstructor'))
        strArray.push(bar('@NoArgsConstructor(access = AccessLevel.PRIVATE)'))
        strArray.push(bar(`@Schema(name = "${inputData.class}", description = "${inputData.class}")`))

        strArray.push(bar(`public class ${inputData.class} {`, 2))
    
        strArray.push(output.value.replaceAll('@', '    @').replaceAll('private', '    private'))
        strArray.push('}')

        output.value = strArray.join('')
    } else {
        convert()
    }

}

/**
 * 개행문자 append
 * @param str : 문자열
 * @param idx : 추가할 개행문자 수
 */
const bar = (str: string, idx: number = 1) => {
    let b = '\n'

    for (let index = 1; index < idx; index++) b += b

    return str.concat(b)
}

const handleChange = () => {
    triggerDblClick(document.getElementById('package'))
}

/**
 * 더블클릭 이벤트
 * @param checkbox 
 */
const triggerDblClick = (checkbox: any) => {
    checkbox.click();
    checkbox.click();
};

</script>

<style scoped>
.converter-wrapper {
  padding: 10px;
}

.converter-header {
  margin-bottom: 2rem;
}

.gradient-title {
  font-family: 'Outfit', 'Noto Sans KR', sans-serif;
  font-size: 2.2rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #34d399 0%, #60a5fa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
}

.description-text {
  font-size: 1rem;
  color: var(--text-muted);
  line-height: 1.6;
}

.glass-card {
  background: var(--card-bg);
  border: 1px solid var(--nav-border);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  margin-bottom: 24px;
}

.card-header-custom {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--nav-border);
  padding-bottom: 12px;
}

.card-header-custom h2 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-main);
}

.icon-gear {
  color: var(--nav-active-text);
}

/* Radio Chips styling */
.config-group {
  margin-bottom: 20px;
}

.group-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #64748b;
  margin-bottom: 10px;
}

.radio-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--nav-border);
  border-radius: 9999px;
  color: var(--nav-text);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.chip:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(52, 211, 153, 0.3);
}

.chip.active {
  background: linear-gradient(135deg, rgba(52, 211, 153, 0.2) 0%, rgba(96, 165, 250, 0.2) 100%);
  border-color: rgba(52, 211, 153, 0.5);
  color: #34d399;
  box-shadow: 0 4px 12px rgba(52, 211, 153, 0.2);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

/* Select Box & Text Input styling */
.input-details-group,
.select-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.input-field,
.select-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-field label,
.select-field label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #94a3b8;
}

.input-field input,
.custom-select {
  background: var(--input-bg);
  border: 1px solid var(--nav-border);
  border-radius: 8px;
  padding: 10px 14px;
  color: var(--text-main);
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s ease;
}

.custom-select option {
  background-color: var(--nav-bg);
  color: var(--text-main);
}

.input-field input:focus,
.custom-select:focus {
  border-color: rgba(52, 211, 153, 0.5);
  box-shadow: 0 0 10px rgba(52, 211, 153, 0.15);
}

/* Switches */
.checkbox-switches {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 15px;
}

.switch-container {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.custom-switch-input {
  display: none;
}

.custom-switch-slider {
  position: relative;
  width: 40px;
  height: 20px;
  background-color: var(--switch-bg);
  border-radius: 9999px;
  transition: background-color 0.3s;
  border: 1px solid var(--nav-border);
}

.custom-switch-slider::before {
  content: "";
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: var(--nav-active-text);
  transition: transform 0.3s, background-color 0.3s;
}

.custom-switch-input:checked + .custom-switch-slider {
  background-color: rgba(52, 211, 153, 0.2);
  border-color: rgba(52, 211, 153, 0.4);
}

.custom-switch-input:checked + .custom-switch-slider::before {
  transform: translateX(20px);
  background-color: var(--nav-active-text);
}

.switch-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-main);
}

/* Inherits editor styles from ui.css. Only keep pre-wrap word wrapping for pre tags */
.output-area {
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* Copy button */
.btn-copy-floating {
  background: rgba(52, 211, 153, 0.1);
  border: 1px solid rgba(52, 211, 153, 0.3);
  color: #34d399;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-copy-floating:hover {
  background: rgba(52, 211, 153, 0.2);
  transform: translateY(-1px);
}

/* Schema layout styling */
.schema-layout {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.download-bar {
  display: flex;
  justify-content: flex-end;
}

.editor-columns {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.output-card-large {
  margin-top: 10px;
}

.output-area-large {
  min-height: 450px;
  background: var(--textarea-output-bg);
  color: var(--textarea-text);
  white-space: pre-wrap;
  word-wrap: break-word;
}

@media (max-width: 992px) {
  .editor-grid {
    flex-direction: column;
  }
  .editor-columns {
    grid-template-columns: 1fr;
  }
}

/* Syntax Highlighting Token Styles */
.converter-wrapper {
  --token-keyword: #60a5fa;
  --token-annotation: #34d399;
  --token-string: #fbbf24;
  --token-comment: #64748b;
  --token-tag: #f472b6;
  --token-attr-name: #38bdf8;
  --token-attr-value: #fbbf24;
  --token-variable: #a78bfa;
}

:global([data-bs-theme="light"]) .converter-wrapper {
  --token-keyword: #2563eb;
  --token-annotation: #059669;
  --token-string: #b45309;
  --token-comment: #94a3b8;
  --token-tag: #db2777;
  --token-attr-name: #0284c7;
  --token-attr-value: #d97706;
  --token-variable: #7c3aed;
}

.output-area :deep(.token-keyword),
.output-area-large :deep(.token-keyword) {
  color: var(--token-keyword);
  font-weight: bold;
}
.output-area :deep(.token-annotation),
.output-area-large :deep(.token-annotation) {
  color: var(--token-annotation);
}
.output-area :deep(.token-string),
.output-area-large :deep(.token-string) {
  color: var(--token-string);
}
.output-area :deep(.token-comment),
.output-area-large :deep(.token-comment) {
  color: var(--token-comment);
  font-style: italic;
}
.output-area :deep(.token-tag),
.output-area-large :deep(.token-tag) {
  color: var(--token-tag);
  font-weight: bold;
}
.output-area :deep(.token-attr-name),
.output-area-large :deep(.token-attr-name) {
  color: var(--token-attr-name);
}
.output-area :deep(.token-attr-value),
.output-area-large :deep(.token-attr-value) {
  color: var(--token-attr-value);
}
.output-area :deep(.token-variable),
.output-area-large :deep(.token-variable) {
  color: var(--token-variable);
}
</style>
