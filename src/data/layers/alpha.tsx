/**
 * @module
 * @hidden
 */
import { main } from "data/projEntry";
import { createCumulativeConversion } from "features/conversion";
import { jsx } from "features/feature";
import { createHotkey } from "features/hotkey";
import { createReset } from "features/reset";
import MainDisplay from "features/resources/MainDisplay.vue";
import { createResource } from "features/resources/resource";
import { addTooltip } from "features/tooltips/tooltip";
import { createResourceTooltip } from "features/trees/tree";
import { BaseLayer, createLayer } from "game/layers";
import type { DecimalSource } from "util/bignum";
import { render } from "util/vue";
import { createLayerTreeNode, createResetButton } from "../common";
import { createRepeatable } from "features/repeatable";
import { createCostRequirement } from "game/requirements";
import { createRequire } from "module";
import Formula from "game/formulas/formulas";
import { noPersist } from "game/persistence";

const id = 'a'
const layer = createLayer(id, function(this: BaseLayer) {
    const name = "Alpha";
    const color = "#808080";
    const points = createResource<DecimalSource>(0, "alpha");
    const symbol = 'α';
    const conversion = createCumulativeConversion(() => ({
        formula: x => x.div(5).sqrt(),
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
        display: symbol
    }));
    addTooltip(treeNode, {
        display: createResourceTooltip(points),
        pinnable: true
    });
    const resetButton = createResetButton(() => ({
        conversion,
        tree: main.tree,
        treeNode
    }));
    const hotkey = createHotkey(() => ({
        description: "A: Do an α reset.",
        key: "a",
        onPress: resetButton.onClick
    }));
    const t1gen = createRepeatable(() => ({
        requirements: createCostRequirement(() => ({
            resource: noPersist(points),
            cost: Formula.variable(t1gen.amount).div(5).floor().pow_base(3)
        })),
        display: {
            title: "Generator α1",
            description: "Generates 1 α power per second",
            // effectDisplay: 
        }
    }))
    return {
        name,
        color,
        points,
        display: jsx(() => (
            <>
                <MainDisplay resource={points} color={color} />
                {render(resetButton)}
                {render(t1gen)}
            </>
        )),
        treeNode,
        hotkey
    };
})

export default layer;
