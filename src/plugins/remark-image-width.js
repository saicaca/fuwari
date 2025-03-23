import { visit } from "unist-util-visit";

export default function remarkImageWidth() {
    var regex = / w-([0-9]+)%/
    const transformer = async tree => {
        const visitor = (paragraphNode, index, parent) => {
            if (index === undefined || parent === undefined) return

            parent.children.forEach((node, index, parent) => {
                if (node.type === 'text' && node.data !== undefined && node.data.hName === 'figure') {
                    findImgNodes(node).forEach(imgNode => {
                        if (imgNode.properties.alt.search(regex) != -1) {
                            imgNode.properties.width = `${imgNode.properties.alt.match(regex)[1]}%`
                            imgNode.properties.alt = imgNode.properties.alt.replace(regex, "")
                        }
                    })
                }
            })
        }
        visit(tree, 'paragraph', visitor)
    }
    return transformer
}

function findImgNodes(node, imgNodes = []) {
    if (node.tagName === 'img') {
        imgNodes.push(node)
    } else if (node.data !== undefined && node.data.hChildren !== undefined) {
        node.data.hChildren.forEach(child => findImgNodes(child, imgNodes))
    } else if (node.children !== undefined) {
        node.children.forEach(child => findImgNodes(child, imgNodes))
    }
    return imgNodes
}
