import NPCActor from "../../../Actors/NPCActor";
import NPCBehavior from "../NPCBehavior";
import GoalReached from "../NPCStatuses/FalseStatus";
import GameEvent from "../../../../Wolfie2D/Events/GameEvent";
import Idle from "../NPCActions/GotoAction";
import { TargetExists } from "../NPCStatuses/TargetExists";
import BasicFinder from "../../../GameSystems/Searching/BasicFinder";
import { ClosestPositioned } from "../../../GameSystems/Searching/HW4Reducers";
import { AllyFilter, BattlerActiveFilter, BattlerGroupFilter, BattlerHealthFilter, ItemFilter, RangeFilter, VisibleItemFilter } from "../../../GameSystems/Searching/HW4Filters";
import PickupItem from "../NPCActions/PickupItem";
import UseHealthpack from "../NPCActions/UseHealthpack";
import Healthpack from "../../../GameSystems/ItemSystem/Items/Healthpack";
import Item from "../../../GameSystems/ItemSystem/Item";
import { HasItem } from "../NPCStatuses/HasItem";
import FalseStatus from "../NPCStatuses/FalseStatus";
import Battler from "../../../GameSystems/BattleSystem/Battler";
import { TargetableEntity } from "../../../GameSystems/Targeting/TargetableEntity";
import GoapAction from "../../../../Wolfie2D/AI/Goap/GoapAction";
import GoapState from "../../../../Wolfie2D/AI/Goap/GoapState";

/**
 * When an NPC is acting as a healer, their goal is to try and heal it's teammates by running around, picking up healthpacks, 
 * bringing to the healthpacks to their allies and healing them.
 */
export default class HealerBehavior extends NPCBehavior  {

    /** The GameNode that owns this NPCGoapAI */
    protected override owner: NPCActor;
    /** The target the guard should guard */
    protected target: TargetableEntity;
    /** The range the guard should be from the target they're guarding to be considered guarding the target */
    protected range: number;

    /** Initialize the NPC AI */
    public initializeAI(owner: NPCActor, opts: Record<string, any>/*, options: HealerOptions*/): void {
        super.initializeAI(owner, opts);

        //this.target = opts.target
        //this.range = opts.range;

        let scene = owner.getScene();

        /* ######### Add all healer statuses ######## */

        this.addStatus(HealerStatuses.GOAL, new FalseStatus());

        // Check if a healthpack exists in the scene and it's visible
        this.addStatus(HealerStatuses.HPACK_EXISTS, new TargetExists(scene.getHealthpacks(), new BasicFinder<Item>(null, ItemFilter(Healthpack), VisibleItemFilter())));

        // Check if a healthpack exists in the actors inventory
        this.addStatus(HealerStatuses.HAS_HPACK, new HasItem(owner, new BasicFinder<Item>(null, ItemFilter(Healthpack))));

        // Check if a lowhealth ally exists in the scene
        let lowhealthAlly = new BasicFinder<Battler>(null, BattlerActiveFilter(), BattlerGroupFilter([owner.battleGroup]));
        this.addStatus(HealerStatuses.ALLY_EXISTS, new TargetExists(scene.getBattlers(), lowhealthAlly));
        
        /* ######### Add all healer actions ######## */

        // TODO configure the rest of the healer actions

        // Idle action
        let idle = new Idle(this, this.owner);
        idle.addEffect(HealerStatuses.GOAL);
        idle.cost = 100;
        this.addState(HealerActions.IDLE, idle);

        /* ######### Set the healers goal ######## */

        this.goal = HealerStatuses.GOAL;
        this.initialize();
    }

    public override handleEvent(event: GameEvent): void {
        switch(event.type) {
            default: {
                super.handleEvent(event);
                break;
            }
        }
    }

    public override update(deltaT: number): void {
        super.update(deltaT);
    }

    protected initializeStatuses(): void {

        let scene = this.owner.getScene();

        // A status checking if there are any enemies at target the guard is guarding
        let allyBattleFinder = new BasicFinder<Battler>(null, BattlerActiveFilter(), AllyFilter(this.owner), RangeFilter(this.target, 0, this.range*this.range))
        let allyExists = new TargetExists(scene.getBattlers(), allyBattleFinder)
        this.addStatus(HealerStatuses.ALLY_EXISTS, allyExists);

        // Add a status to check if a lasergun exists in the scene and it's visible
        this.addStatus(HealerStatuses.HPACK_EXISTS, new TargetExists(scene.getHealthpacks(), new BasicFinder<Item>(null, ItemFilter(Healthpack), VisibleItemFilter())));
        // Add a status to check if the guard has a lasergun
        this.addStatus(HealerStatuses.HAS_HPACK, new HasItem(this.owner, new BasicFinder(null, ItemFilter(Healthpack))));

        // Add the goal status 
        this.addStatus(HealerStatuses.GOAL, new FalseStatus());
    }

    protected initializeActions(): void {

        let scene = this.owner.getScene();

        // An action for healing an ally in the guards guard area
        let healAlly = new UseHealthpack(this, this.owner);
        healAlly.targets = scene.getBattlers();
        healAlly.targetFinder = new BasicFinder<Battler>(ClosestPositioned(this.owner), BattlerActiveFilter(), AllyFilter(this.owner), RangeFilter(this.target, 0, this.range*this.range));
        healAlly.addPrecondition(HealerStatuses.HAS_HPACK);
        healAlly.addPrecondition(HealerStatuses.ALLY_EXISTS);
        healAlly.addEffect(HealerStatuses.GOAL);
        healAlly.cost = 1;
        this.addState(HealerActions.USE_HPACK, healAlly);

        // An action for picking up a healthpack
        let pickupHealthPack = new PickupItem(this, this.owner);
        pickupHealthPack.targets = scene.getHealthpacks();
        pickupHealthPack.targetFinder = new BasicFinder<Item>(ClosestPositioned(this.owner), VisibleItemFilter(), ItemFilter(Healthpack));
        pickupHealthPack.addPrecondition(HealerStatuses.HPACK_EXISTS);
        pickupHealthPack.addEffect(HealerStatuses.HAS_HPACK);
        pickupHealthPack.cost = 5;
        this.addState(HealerActions.PICKUP_HPACK, pickupHealthPack);

        let idle = new Idle(this, this.owner);
        idle.targets = [this.target];
        idle.targetFinder = new BasicFinder();
        idle.addPrecondition(HealerStatuses.HAS_HPACK);
        idle.addEffect(HealerStatuses.GOAL);
        idle.cost = 1000;
        this.addState(HealerActions.IDLE, idle);
    }

    public override addState(stateName: HealerAction, state: GoapAction): void {
        super.addState(stateName, state);
    }

    public override addStatus(statusName: HealerStatus, status: GoapState): void {
        super.addStatus(statusName, status);
    }
}

export interface HealerOptions {
    target: TargetableEntity
    range: number;
}

// World states for the healer
export type HealerStatus = typeof HealerStatuses[keyof typeof HealerStatuses];
export const HealerStatuses = {

    // Whether or not a healthpack exists in the world
    HPACK_EXISTS: "hpack-exists",

    // Whether the healer has a healthpack in their inventory or not
    ALLY_EXISTS: "ally-exists",

    // Whether the healer has any allies in the game world or not
    HAS_HPACK: "has-hpack",

    // Whether the healer has reached it's goal or not
    GOAL: "goal"

} as const

// Healer actions
export type HealerAction = typeof HealerActions[keyof typeof HealerActions];
export const HealerActions = {

    PICKUP_HPACK: "pickup-hpack",

    USE_HPACK: "use-hpack",

    IDLE: "idle",

} as const;

