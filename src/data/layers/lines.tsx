import { main } from "data/projEntry"
import { jsx } from "features/feature"
import { BaseLayer, createLayer } from "game/layers"
import MainDisplay from "features/resources/MainDisplay.vue";
import { createLayerTreeNode, createResetButton } from "data/common";
import { createResource, trackTotal } from "features/resources/resource";
import Decimal, { DecimalSource } from "lib/break_eternity";
import { createCumulativeConversion } from "features/conversion";
import { createReset } from "features/reset";
import { addTooltip } from "features/tooltips/tooltip";
import { createResourceTooltip } from "features/trees/tree";
import { createHotkey } from "features/hotkey";
import { render } from "util/vue";
import { computed, unref } from "vue";
import { format } from "util/break_eternity";
import vertices from "./vertices";

const id = 'l'
const layer = createLayer(id, function (this: BaseLayer) {
    const name = "Lines"
    const color = "#8390c4"
    const points = createResource<DecimalSource>(0, "lines");
    const total = trackTotal(points)

    const effect = computed(() => {
        return Decimal.add(unref(total), 1).ln().add(1)
    })
    
    const conversion = createCumulativeConversion(() => ({
        formula: x => x.log10().add(1).div(4),
        baseResource: main.points,
        gainResource: points
    }));

    const reset = createReset(() => ({
        thingsToReset: (): Record<string, unknown>[] => [layer]
    }));

    const treeNode = createLayerTreeNode(() => ({
        layerID: id,
        color,
        reset,
        visibility: vertices.pushUpgrade.bought
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
        description: "Reset for lines",
        key: "l",
        onPress: resetButton.onClick
    }));

    const upgrades = {
    }
    
    return {
        name, color, points, total, effect, treeNode, tooltip, hotkey, upgrades,
        display: jsx(() => (<>
            <MainDisplay resource={points} color={color} effectDisplay={"multiplying your vertex gain by "+format(effect.value)+"x"} />
            {render(resetButton)}
        </>))
    }
})

export default layer