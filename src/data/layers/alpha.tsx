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
import { render, renderRow } from "util/vue";
import { createLayerTreeNode, createResetButton } from "../common";
import { GenericRepeatable, RepeatableOptions, createRepeatable } from "features/repeatable";
import { createCostRequirement, displayRequirements } from "game/requirements";
import Formula from "game/formulas/formulas";
import { noPersist, persistent } from "game/persistence";
import Decimal from "util/bignum";
import { BonusAmountFeatureOptions, GenericBonusAmountFeature, bonusAmountDecorator } from "features/decorators/bonusDecorator";
import { unref } from "vue";
import { EffectFeatureOptions, GenericEffectFeature, effectDecorator } from "features/decorators/common";
import { ProcessedComputable } from "util/computed";
import { format } from "util/break_eternity";

type GeneratorOptions = RepeatableOptions & EffectFeatureOptions & BonusAmountFeatureOptions;
type GenericGenerator = GenericRepeatable & GenericEffectFeature & GenericBonusAmountFeature & { effect: ProcessedComputable<Decimal> };

const id = 'a'
const layer = createLayer(id, function(this: BaseLayer) {
    const name = "Alpha";
    const color = "#808080";
    const points = createResource<DecimalSource>(0, "alpha");
    const power = createResource<DecimalSource>(0, "alpha power", 2);
    const symbol = 'α';
    const conversion = createCumulativeConversion(() => ({
        formula: x => x.sqrt(),
        baseResource: noPersist(main.points),
        gainResource: noPersist(points)
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
        description: "A: Do an α reset.",
        key: "a",
        onPress: resetButton.onClick
    }));
    const t1gen = createRepeatable<GeneratorOptions>(() => ({
        requirements: createCostRequirement(() => ({
            resource: noPersist(points),
            cost: Formula.variable(t1gen.amount).div(5).floor().pow_base(3),
            canMaximize: false
        })),
        display: jsx(() => (
            <div>
                <h3>First generator</h3><br />
                Generates α power
                <div><br />Amount: {format(unref(t1gen.amount.value))} + {format(unref(t1gen.bonusAmount))}</div><br />
                {displayRequirements(t1gen.requirements)}<br />
                Effect: {format(unref(t1gen.effect), 3)} α power/s
            </div>
        )),
        style: {
            width: "150px",
            height: "150px"
        },
        effect() { return Decimal.div(t1gen.amount.value, 100).plus(1).times(t1gen.totalAmount.value).div(10); },
        bonusAmount: persistent<DecimalSource>(0)
    }), effectDecorator, bonusAmountDecorator) as GenericGenerator
    const t2gen = createRepeatable<GeneratorOptions>(() => ({
        requirements: createCostRequirement(() => ({
            resource: noPersist(points),
            cost: Formula.variable(t2gen.amount).div(3).floor().pow_base(5).mul(5),
            canMaximize: false
        })),
        display: jsx(() => (
            <div>
                <h3>Second generator</h3><br />
                Generates extra first generators
                <div><br />Amount: {format(unref(t2gen.amount.value))} + {format(unref(t2gen.bonusAmount))}</div><br />
                {displayRequirements(t2gen.requirements)}<br />
                Effect: {format(unref(t2gen.effect), 3)} extra first generator/s
            </div>
        )),
        style: {
            width: "150px",
            height: "150px"
        },
        effect() { return Decimal.div(t2gen.amount.value, 100).plus(1).times(t2gen.totalAmount.value).div(10).div(Decimal.add(t1gen.bonusAmount.value, 1)); },
        bonusAmount: persistent<DecimalSource>(0)
    }), effectDecorator, bonusAmountDecorator) as GenericGenerator
    const t3gen = createRepeatable<GeneratorOptions>(() => ({
        requirements: createCostRequirement(() => ({
            resource: noPersist(points),
            cost: Formula.variable(t3gen.amount).pow_base(10).mul(15),
            canMaximize: false
        })),
        display: jsx(() => (
            <div>
                <h3>Third generator</h3><br />
                Generates extra second generators
                <div><br />Amount: {format(unref(t3gen.amount.value))} + {format(unref(t3gen.bonusAmount))}</div><br />
                {displayRequirements(t3gen.requirements)}<br />
                Effect: {format(unref(t3gen.effect), 3)} extra second generator/s
            </div>
        )),
        style: {
            width: "150px",
            height: "150px"
        },
        effect() { return Decimal.div(t3gen.amount.value, 50).plus(1).times(t3gen.totalAmount.value).div(200).div(Decimal.add(t2gen.bonusAmount.value, 1)); },
        bonusAmount: persistent<DecimalSource>(0)
    }), effectDecorator, bonusAmountDecorator) as GenericGenerator
    const t4gen = createRepeatable<GeneratorOptions>(() => ({
        requirements: createCostRequirement(() => ({
            resource: noPersist(points),
            cost: Formula.variable(t4gen.amount).pow_base(10).mul(15),
            canMaximize: false
        })),
        display: jsx(() => (
            <div>
                <h3>Fourth generator</h3><br />
                Generates extra third generators
                <div><br />Amount: {format(unref(t4gen.amount.value))} + {format(unref(t4gen.bonusAmount))}</div><br />
                {displayRequirements(t4gen.requirements)}<br />
                Effect: {format(unref(t4gen.effect), 3)} extra third generator/s
            </div>
        )),
        style: {
            width: "150px",
            height: "150px"
        },
        effect() { return Decimal.div(t4gen.amount.value, 100).plus(1).times(t4gen.totalAmount.value).div(1000).div(Decimal.add(t3gen.bonusAmount.value, 1)); },
        bonusAmount: persistent<DecimalSource>(0)
    }), effectDecorator, bonusAmountDecorator) as GenericGenerator
    this.on("update", diff => {
        power.value = Decimal.mul(diff, unref(t1gen.effect)).add(power.value)
        t1gen.bonusAmount.value = Decimal.mul(diff, unref(t2gen.effect)).add(unref(t1gen.bonusAmount))
        t2gen.bonusAmount.value = Decimal.mul(diff, unref(t3gen.effect)).add(unref(t2gen.bonusAmount))
        t3gen.bonusAmount.value = Decimal.mul(diff, unref(t4gen.effect)).add(unref(t3gen.bonusAmount))
    });
    function effect() {
        return Decimal.add(power.value, 1).log10()
    }
    return {
        name,
        color,
        points,
        power,
        display: jsx(() => (
            <>
                <MainDisplay resource={points} color={color} />
                {render(resetButton)} <br />
                <MainDisplay resource={power} color={color} />
                {renderRow(t1gen, t2gen, t3gen, t4gen)}
            </>
        )),
        treeNode,
        hotkey,
        gens: [t1gen, t2gen, t3gen, t4gen],
        tooltip,
        effect
    };
})

export default layer;
