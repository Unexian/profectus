import { main } from "data/projEntry"
import { jsx } from "features/feature"
import { BaseLayer, createLayer } from "game/layers"
import MainDisplay from "features/resources/MainDisplay.vue";
import { createLayerTreeNode, createResetButton } from "data/common";
import { createResource } from "features/resources/resource";
import { DecimalSource } from "lib/break_eternity";
import { createCumulativeConversion } from "features/conversion";
import { createReset } from "features/reset";
import { addTooltip } from "features/tooltips/tooltip";
import { createResourceTooltip } from "features/trees/tree";
import { createHotkey } from "features/hotkey";
import { render } from "util/vue";

const id = 'iq'
const layer = createLayer(id, function (this: BaseLayer) {
    const name = "Irregular Quadrilaterals"
    const color = "#8390c4"
    const points = createResource<DecimalSource>(0, "irregular quadrilaterals");
    
    const conversion = createCumulativeConversion(() => ({
        formula: x => x.log10().sub(2),
        baseResource: main.points,
        gainResource: points
    }));

    const reset = createReset(() => ({
        thingsToReset: (): Record<string, unknown>[] => [layer]
    }));

    const treeNode = createLayerTreeNode(() => ({
        layerID: id,
        color,
        reset
    }));
    
    const tooltip = addTooltip(treeNode, {
        display: createResourceTooltip(points),
        pinnable: true
    });

    const resetButton = createResetButton(() => ({
        conversion,
        tree: main.tree,
        treeNode
    }));

    const hotkey = createHotkey(() => ({
        description: "Reset for irregular quadrilaterals",
        key: "i",
        onPress: resetButton.onClick
    }));

    const upgrades = {
    }
    
    return {
        name, color, points, treeNode, tooltip, hotkey, upgrades,
        display: jsx(() => (<>
            <MainDisplay resource={points} color={color} />
            {render(resetButton)}
        </>))
    }
})

export default layer