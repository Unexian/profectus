import Spacer from "components/layout/Spacer.vue";
import { findFeatures, jsx } from "features/feature";
import { createResource, trackBest, trackOOMPS, trackTotal } from "features/resources/resource";
import type { GenericTree } from "features/trees/tree";
import { defaultResetPropagation, createTree } from "features/trees/tree";
import { globalBus } from "game/events";
import type { BaseLayer, GenericLayer } from "game/layers";
import { createLayer } from "game/layers";
import type { Player } from "game/player";
import player from "game/player";
import type { DecimalSource } from "util/bignum";
import Decimal, { format, formatTime } from "util/bignum";
import { render } from "util/vue";
import { computed, unref } from "vue";
import vertices from "./layers/vertices";
import lines from "./layers/lines";
import { UpgradeType, type GenericUpgrade } from "features/upgrades/upgrade";

/**
 * @hidden
 */
export const main = createLayer("main", function (this: BaseLayer) {
    const points = createResource<DecimalSource>(10, "vertices");
    const best = trackBest(points);
    const total = trackTotal(points);

    const vertexUpgrades = computed(() => (findFeatures(vertices, UpgradeType) as GenericUpgrade[]).filter(t => unref(t.bought)).length)

    const pointGain = computed(() => {
        // eslint-disable-next-line prefer-const
        if (!unref(vertices.upgrades[11].bought)) return new Decimal(0)

        let gain = new Decimal(1);

        if (unref(vertices.upgrades[12].bought)) gain = gain.mul(2)
        if (unref(vertices.upgrades[13].bought)) gain = gain.mul(Decimal.div(unref(vertexUpgrades), 3).add(1))
        if (unref(vertices.upgrades[14].bought)) gain = gain.mul(Decimal.add(points.value, 1).log10().add(1))
        gain = gain.mul(Decimal.pow(1.5, unref(vertices.repeatables[21].amount)))

        return gain;
    });
    globalBus.on("update", diff => {
        points.value = Decimal.add(points.value, Decimal.times(pointGain.value, diff));
    });
    const oomps = trackOOMPS(points, pointGain);

    const tree = createTree(() => ({
        nodes: [[vertices.treeNode], [lines.treeNode]],
        branches: [
            {startNode: lines.treeNode, endNode: vertices.treeNode}
        ],
        onReset() {
            points.value = 10;
            best.value = points.value;
            total.value = points.value;
        },
        resetPropagation: defaultResetPropagation
    })) as GenericTree;

    return {
        name: "Tree",
        links: tree.links,
        display: jsx(() => (
            <>
                {player.devSpeed === 0 ? <div>Game Paused</div> : null}
                {player.devSpeed != null && player.devSpeed !== 0 && player.devSpeed !== 1 ? (
                    <div>Dev Speed: {format(player.devSpeed)}x</div>
                ) : null}
                {player.offlineTime != null && player.offlineTime !== 0 ? (
                    <div>Offline Time: {formatTime(player.offlineTime)}</div>
                ) : null}
                <div>
                    {Decimal.lt(points.value, "1e1000") ? <span>You have </span> : null}
                    <h2>{format(points.value)}</h2>
                    {Decimal.lt(points.value, "1e1e6") ? <span> vertices</span> : null}
                </div>
                {Decimal.gt(pointGain.value, 0) ? <div>({oomps.value})</div> : null}
                <Spacer />
                {render(tree)}
            </>
        )),
        points,
        best,
        total,
        oomps,
        tree
    };
});

/**
 * Given a player save data object being loaded, return a list of layers that should currently be enabled.
 * If your project does not use dynamic layers, this should just return all layers.
 */
export const getInitialLayers = (
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    player: Partial<Player>
): Array<GenericLayer> => [main, vertices, lines];

/**
 * A computed ref whose value is true whenever the game is over.
 */
export const hasWon = computed(() => {
    return false;
});

/**
 * Given a player save data object being loaded with a different version, update the save data object to match the structure of the current version.
 * @param oldVersion The version of the save being loaded in
 * @param player The save data being loaded in
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
export function fixOldSave(
    oldVersion: string | undefined,
    player: Partial<Player>
    // eslint-disable-next-line @typescript-eslint/no-empty-function
): void {}
/* eslint-enable @typescript-eslint/no-unused-vars */
