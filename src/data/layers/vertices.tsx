import { main } from "data/projEntry"
import { findFeatures, jsx } from "features/feature"
import { BaseLayer, createLayer } from "game/layers"
import { noPersist } from "game/persistence"
import MainDisplay from "features/resources/MainDisplay.vue";
import { GenericUpgrade, UpgradeType, createUpgrade } from "features/upgrades/upgrade";
import { createCostRequirement } from "game/requirements";
import { createLayerTreeNode } from "data/common";
import { computed, unref } from "vue";
import { render, renderRow } from "util/vue";
import { createReset } from "features/reset";
import Decimal from "util/bignum";
import { addTooltip } from "features/tooltips/tooltip";
import { createRepeatable } from "features/repeatable";
import Formula from "game/formulas/formulas";
import SpacerVue from "components/layout/Spacer.vue";

const id = 'v'
const layer = createLayer(id, function (this: BaseLayer) {
    const name = "Vertices"
    const color = "#aaaaaa"
    const points = computed(() => main.points)

    const reset = createReset(() => ({
        thingsToReset: (): Record<string, unknown>[] => [upgrades, repeatables]
    }));

    const treeNode = createLayerTreeNode(() => ({
        layerID: id,
        color,
        reset
    }));

    const vertexUpgrades = computed(() => (findFeatures(layer, UpgradeType) as GenericUpgrade[]).filter(t => unref(t.bought)).length)

    const upgrades = {
        11: createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points.value),
                cost: 10
            })),
            display: {
                description: "Start generating vertices"
            }
        })),
        12: createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points.value),
                cost: 10
            })),
            display: {
                description: "Double vertex generation"
            },
            visibility: upgrades[11].bought
        })),
        13: createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points.value),
                cost: 20
            })),
            display: {
                description: "Vertex generation is multiplied by 1+(vertex upgrades/3)"
            },
            visibility: upgrades[12].bought
        })),
        14: createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points.value),
                cost: 40
            })),
            display: {
                description: "Multiply vertex generation by log<sub>10</sub>(vertices+1)+1",
            },
            visibility: upgrades[13].bought
        }))
    }
    const repeatables = {
        21: createRepeatable(repeatable => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points.value),
                cost: Formula.variable(repeatable.amount).mul(50).add(50)
            })),
            display: {
                description: "Multiply vertex generation by 1.33 per upgrade"
            },
            visibility: upgrades[14].bought
        }))
    }
    const pushUpgrade = createUpgrade(upgrade => ({
        requirements: createCostRequirement(() => ({
            resource: noPersist(points.value),
            cost: 750
        })),
        display: {
            description: "Unlock the next layer (permanent)",
        },
        visibility: computed(() => Decimal.gte(unref(repeatables[21].amount), 10) || unref(upgrade.bought)),
        mark: true
    }))
    // reload
    addTooltip(upgrades[13], ({
        display: computed(() => `currently: ${Decimal.div(unref(vertexUpgrades), 3).add(1)}x`)
    }))
    addTooltip(upgrades[14], ({
        display: computed(() => `currently: ${Decimal.add(unref(points).value, 1).log10().add(1)}x`)
    }))
    
    return {
        name, color, points, treeNode, upgrades, repeatables, pushUpgrade,
        display: jsx(() => (<>
            <MainDisplay resource={points.value} color={color} />
            {renderRow(upgrades[11], upgrades[12], upgrades[13], upgrades[14])}
            {renderRow(repeatables[21], pushUpgrade)}
        </>))
    }
})

export default layer