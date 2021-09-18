/**
 * parseOBJ
 * @param {string} text
 * @return {any}
 */
export function parseOBJ(text: string) {
    // because indices are base 1 let's just fill in the 0th data
    const objPositions = [[0, 0, 0]];
    const objTexcoords = [[0, 0]];
    const objNormals = [[0, 0, 0]];

    // same order as `f` indices
    const objVertexData = [
        objPositions,
        objTexcoords,
        objNormals,
    ];

    // same order as `f` indices
    const webglVertexData: any = [
        [], // positions
        [], // texcoords
        [], // normals
    ];

    /**
     * addVertex
     * @param {any} vert
     */
    function addVertex(vert: any) {
        const ptn = vert.split('/');
        ptn.forEach((objIndexStr:any, i:any) => {
            if (!objIndexStr) {
                return;
            }
            const objIndex = parseInt(objIndexStr);
            const index = objIndex +
                (objIndex >= 0 ? 0 : objVertexData[i].length);
            webglVertexData[i].push(...objVertexData[i][index]);
        });
    }

    const keywords:any = {
        v(parts: any) {
            objPositions.push(parts.map(parseFloat));
        },
        vn(parts: any) {
            objNormals.push(parts.map(parseFloat));
        },
        vt(parts: any) {
            // should check for missing v and extra w?
            objTexcoords.push(parts.map(parseFloat));
        },
        f(parts: any) {
            const numTriangles = parts.length - 2;
            for (let tri = 0; tri < numTriangles; ++tri) {
                addVertex(parts[0]);
                addVertex(parts[tri + 1]);
                addVertex(parts[tri + 2]);
            }
        },
    };

    const keywordRE = /(\w*)(?: )*(.*)/;
    const lines = text.split('\n');
    for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
        const line = lines[lineNo].trim();
        if (line === '' || line.startsWith('#')) {
            continue;
        }
        const m = keywordRE.exec(line);
        if (!m) {
            continue;
        }
        const [, keyword, unparsedArgs] = m;
        const parts = line.split(/\s+/).slice(1);
        const handler = keywords[keyword];
        if (!handler) {
            console.warn('unhandled keyword:', keyword);
            continue;
        }
        handler(parts, unparsedArgs);
    }

    return {
        position: webglVertexData[0],
        texcoord: webglVertexData[1],
        normal: webglVertexData[2],
    };
}
