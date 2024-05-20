<template>
    <div>
        <h1>테이블 컬럼 카멜 표기법 변환기</h1>
        <p>이 프로그램을 통해 Underscore Notation으로 표기된 테이블 컬럼명을 Camel Notation으로 변환된 자바 필드명으로 변경할 수 있다.</p>
        <h2>사용법</h2>
        <ol>
        </ol>
        <form name="conf">
            <fieldset>
                <legend>Configurations</legend>
                <p>
                    <strong>Conversion Style</strong>
                    <br>
                    <input id="code_basic" type="radio" value="code_basic" checked v-model="checked" @change="convert()"/>
                        <label for="code_basic">Basic</label>&nbsp;
                    <input id="code_vo" type="radio" value="code_vo" v-model="checked" @change="convert()"/>
                        <label for="code_vo">VO</label>&nbsp;
                    <input id="code_resultmap" type="radio" value="code_resultmap" v-model="checked" @change="convert()"/>
                        <label for="code_resultmap">ResultMap</label>&nbsp;
                    <input id="code_select" type="radio" value="code_select" v-model="checked" @change="convert()"/>
                        <label for="code_select">Select</label>&nbsp;
                    <input id="code_insert" type="radio" value="code_insert" v-model="checked" @change="convert()"/>
                        <label for="code_insert">Insert</label>&nbsp;
                    <input id="code_update" type="radio" value="code_update" v-model="checked" @change="convert()"/>
                        <label for="code_update">Update</label>&nbsp;
                    <input id="code_delete" type="radio" value="code_delete" v-model="checked" @change="convert()"/>
                        <label for="code_delete">Delete</label>&nbsp;
                    <input id="code_queryStr" type="radio" value="code_queryStr" v-model="checked" @change="convert()"/>
                        <label for="code_queryStr">캬</label>&nbsp;
                </p>
                <div id="options">
                    <div v-show="voOptions">
                        <p>
                            <strong>ModifierDatatype</strong>
                            <br>
                            <select id="modifier" @change="convert()" v-model="modifierOptions">
                                <option>public</option>
                                <option>protected</option>
                                <option selected>private</option>
                            </select>
                            <select id="datatype" @change="convert()" v-model="datatypeOptions">
                                <option>int</option>
                                <option>long</option>
                                <option>float</option>
                                <option>double</option>
                                <option>byte[]</option>
                                <option>boolean</option>
                                <option>char</option>
                                <option selected>String</option>
                            </select>
                        </p>
                        <p>
                            <strong>Annotation</strong>
                            <br>
                            <input type="radio" id="schema" @change="convert()" v-model="annotationCheck" value="schema"/><label for="schema">@Schema</label>
                            <input type="radio" id="column" @change="convert()" v-model="annotationCheck" value="column"/><label for="column">@Column</label>
                        </p>
                        <div>
                            <p>
                                <input type="checkbox" id="package" name="package" @click="createPackage()" v-model="checkBoxDisplay"/><label for="">createPackage</label>
                            </p>
                            <div v-show="checkBoxDisplay">
                                ClassName: <input id="ClassName" type="text" name="ClassName" @keyup="to => { inputData.class = to.target.value; handleChange(); }" />&nbsp;
                                PackageName: <input id="PackageName" type="text" name="PackageName" @keyup="to => { inputData.package = to.target.value; handleChange(); }" />&nbsp;
                            </div>
                        </div>
                    </div>
                    <div>
                        <p v-show="resultmapOptions">
                            id: <input id="_id" type="text" name="_id" @keyup="convert();" value=""/>&nbsp;
                            class: <input id="_class" type="text" name="_class" @keyup="convert();" value=""/>
                        </p>
                        <p v-show="tableOptions">
                            Table: <input id="table" type="text" name="table" @keyup="convert()" value=""/>&nbsp;
                            AS : <input id="as" type="text" name="as" @keyup="convert()" value=""/>
                        </p>
                    </div>
                </div>
            </fieldset>
        </form>
        <br>
        <div id="basicDiv">
            <textarea class="camel" @keyup="convert()" v-model="input"></textarea>
            &nbsp;
            <textarea class="camel" readonly v-model="output"></textarea>
        </div>
        <div id="schemaDiv">
            <button @click="genFile">save</button>
            <div class="camel-schema-div">
                <div>
                    <strong>Column</strong>
                    <div>
                        <textarea class="camel-schema-tex" @keyup="convert()" v-model="input"></textarea>
                    </div>
                </div>
                <div>
                    <strong>Type</strong>
                    <div>
                        <textarea class="camel-schema-tex" @keyup="convert()" v-model="inputType"></textarea>
                    </div>
                </div>
                <div>
                    <strong>comment</strong>
                    <div>
                        <textarea class="camel-schema-tex" @keyup="convert()" v-model="inputComment"></textarea>
                    </div>
                </div>
            </div>
            <br>
            <br>
            <div>
                <textarea class="" style="width:98.5%; height:600px;" readonly v-model="output"></textarea>
            </div>
        </div>
    </div>
    
    <div>
        <table class="table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Image Upload</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in items" :key="index">
                    <td>{{ item.name }}</td>
                    <td>
                        <input type="file" @change="handleFileUpload(index, $event)">
                        <img :src="item.imageUrl" v-if="item.imageUrl" alt="Uploaded Image">
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
<script setup lang="ts">

import { onMounted, ref } from 'vue';
import { camelStore } from "~/stores/camel";

const store = camelStore();

/**
 * 파일 다운
 */
const genFile = async () => {
    store.data.camelStr = output;

    const result = await store.genFile();
    
    if (0 < result.size) {
        const url = window.URL.createObjectURL(new Blob([result]));
        const link = document.createElement('a');
    
        link.href = url;
        link.setAttribute('download', 'dto.java'); // 다운로드될 파일의 이름과 확장자를 지정합니다.
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

onMounted(() => {
    convert();
})

// default data
const input = ref('USER_ID\nADDR_HOME_STREET\nYOU_LOVE_ME_SO_MUCH\n');
const output = ref();

// schema data
const inputType = ref();
const inputComment = ref();

// default option
const checked = ref('code_basic');
const modifierOptions = ref('private');
const datatypeOptions = ref('String');
<<<<<<< HEAD
const inputData = reactive({
    class: null,
    package: null
});
=======
>>>>>>> 83aeadfa1e1b6dacd34f04657afa78cbece31215

const annotationCheck = ref();
const checkBoxDisplay = ref(false);

const voOptions = ref(false);
const resultmapOptions = ref(false);
const tableOptions = ref(false);

function convert() {
    let count = 0;
    let output1 = '';
    let output2 = '';
    let basicDiv = document.getElementById('basicDiv');
    let schemaDiv = document.getElementById('schemaDiv');
    basicDiv.style = '';
    schemaDiv.style = 'display:none';

    voOptions.value = false;
    resultmapOptions.value = false;
    tableOptions.value = false;


    const linesType = inputType.value?.split(/\n/);
    const linesComment = inputComment.value?.split(/\n/);

    const lines = input.value.split(/\n/);
    
    for(let i = 0, maxi = lines.length; i < maxi; i++) {
        let before = lines[i];
        before = before.toLowerCase().trim();

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
                basicDiv.style = 'display:none';
                schemaDiv.style = '';

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
                output2 += getTableAlias(false) + (before.toUpperCase() + ' = #{' + after + ', jdbcType=VARCHAR}\n');
            } else {
                output2 += ('   AND ' + getTableAlias(false) + before.toUpperCase() + ' = #{' + after + ', jdbcType=VARCHAR}\n');
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
                output2 += ('   #{' + after + ', jdbcType=VARCHAR}');
            } else {
                output2 += ('\n          , #{' + after + ', jdbcType=VARCHAR}');
            }
        } else if('code_update' === checked.value) {
            tableOptions.value = true;

            // Update
            if(count == 0) {
                output1 += getTableAlias(false) + (before.toUpperCase() + ' = #{' + after + ', jdbcType=VARCHAR}');
            } else {
                output1 += ('\n     , ' + getTableAlias(false) + before.toUpperCase() + ' = #{' + after + ', jdbcType=VARCHAR}');
            }

            if(count == 0) {
                output2 += getTableAlias(false) + (before.toUpperCase() + ' = #{' + after + ', jdbcType=VARCHAR}\n');
            } else {
                output2 += ('   AND ' + getTableAlias(false) + before.toUpperCase() + ' = #{' + after + ', jdbcType=VARCHAR}\n');
            }
        } else if('code_delete' === checked.value) {
            tableOptions.value = true;

            // Delete
            if(count == 0) {
                output1 += getTableAlias(false) + (before.toUpperCase() + ' = #{' + after + ', jdbcType=VARCHAR}\n');
            } else {
                output1 += ('   AND ' + getTableAlias(false) + before.toUpperCase() + ' = #{' + after + ', jdbcType=VARCHAR}\n');
            }
        } else if('code_queryStr' === checked.value) {
            // queryStr
            if(count == 0) {
                output1 += ("'" + lines[i] + "'\n");
            } else {
                output1 += (",'" + lines[i] + ((i + 1) == maxi ? "'" : "'\n"));
            }
        } else {
            output1 += (after + '\n');
        }
        
        count++;
    }

    if('code_basic' === checked.value) {
        output.value = output1;
    } else if('code_vo' === checked.value) {
        output.value = output1;
    } else if('code_resultmap' === checked.value) {
        output.value = '<resultMap id="' + document.conf._id.value + '" class="' + document.conf._class.value + '">\n';
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
        output.value = output1;
    }
    
}

function getTableName() {
    let tableName = document.conf.table.value;
    
    if(!tableName) {
        tableName = 'TABLE_NAME';
    }
    return tableName;
}

function getTableAlias(flg: boolean) {
    let alias = '';

    if (document.conf.as.value) {
        alias = `${document.conf.as.value}${'.'}`;
    }

    return flg ? document.conf.as.value : alias;
}

const convertType = (linesType: Array<string>, i: number) => {
    let returnVal = '';

    if (linesType && linesType[i]) {
        const val = linesType[i].replace(/[^A-Za-z]*/g, '').toUpperCase();

        switch (val) {
            case 'BIGINT':
                returnVal = 'Long';
                break;

            case 'INT':
                returnVal = 'Integer';
                break;

            case 'INTEGER':
                returnVal = 'Integer';
                break;

            case 'DOUBLE':
                returnVal = 'Double';
                break;
        
            default:
                returnVal = 'String';
                break;
        }
    }
    return returnVal;
}

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
        items.value[index].imageUrl = reader.result;
    };
    reader.readAsDataURL(file);
};

/**
 * dto 패키지 생성 함수
 */
const createPackage = async () => {
    checkBoxDisplay.value = checkBoxDisplay.value
    
    const bar = '\n'
    const strArray = new Array()
    
    if (!checkBoxDisplay.value) {
        strArray.push(`package ${inputData.package || 'com.app.common.dto'}`.concat(bar).concat(bar))
        strArray.push('import io.swagger.v3.oas.annotations.media.Schema;'.concat(bar))
        strArray.push('import lombok.AccessLevel;'.concat(bar))
        strArray.push('import lombok.Builder;'.concat(bar))
        strArray.push('import lombok.Getter;'.concat(bar))
        strArray.push('import lombok.Setter;'.concat(bar))
        strArray.push('import lombok.ToString;'.concat(bar).concat(bar))
        
        strArray.push('@NoArgsConstructor(access = AccessLevel.PRIVATE)'.concat(bar))
        strArray.push(`public class ${inputData.class || 'ApiBodyDTO'} {`.concat(bar).concat(bar))
    
        strArray.push(output.value.replaceAll('@', '    @').replaceAll('private', '    private '))
        strArray.push('}')

        output.value = strArray.join('')
    } else {
        convert()
    }

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

// watch(checkBoxDisplay, (newVal) => {
//   if (newVal) {
//     nextTick(() => {
//       const classNameInput = document.getElementById('ClassName');
//       if (classNameInput) {
//         classNameInput.focus();
//       }
//     });
//   }
// });

</script>

<style>

</style>