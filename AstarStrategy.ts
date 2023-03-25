import Stack from "../../Wolfie2D/DataTypes/Collections/Stack";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import NavigationPath from "../../Wolfie2D/Pathfinding/NavigationPath";
import NavPathStrat from "../../Wolfie2D/Pathfinding/Strategies/NavigationStrategy";
import GraphUtils from "../../Wolfie2D/Utils/GraphUtils";
import Queue from "../../Wolfie2D/DataTypes/Collections/Queue";
import PositionGraph from "../../Wolfie2D/DataTypes/Graphs/PositionGraph";

// TODO Construct a NavigationPath object using A*

/**
 * The AstarStrategy class is an extension of the abstract NavPathStrategy class. For our navigation system, you can
 * now specify and define your own pathfinding strategy. Originally, the two options were to use Djikstras or a
 * direct (point A -> point B) strategy. The only way to change how the pathfinding was done was by hard-coding things
 * into the classes associated with the navigation system. 
 * 
 * - Peter
 */
export default class AstarStrategy extends NavPathStrat {

    /**
     * @see NavPathStrat.buildPath()
     */
    AstarStrategy(navmesh) {
        this.mesh = navmesh
    }
    
    public buildPath(to: Vec2, from: Vec2): NavigationPath {
        this.mesh
        const startNode = this.mesh.graph.snap(from);
        const goalNode = this.mesh.graph.snap(to);
        console.log(this.mesh.graph)
        const costMap = new Map();
        const parentMap = new Map();
        const queue = new Queue<number>;
        
        costMap.set(startNode, 0);
        queue.enqueue(startNode);
        
        /*while (queue.hasItems) {
            const currNode = queue.dequeue();
            if (currNode === goalNode) {
                const path = new Stack();
                let node = currNode;
                while (node !== startNode) {
                    path.push(node);
                    node = parentMap.get(node);
                }
                path.push(startNode);
                return new NavigationPath(<Stack<Vec2>> path);
            }
            //Write a function to get the neighbors of a node
        
            for (const neighbor of this.mesh.graph.getEdges(currNode).next) {
                const newCost = costMap.get(currNode) + currNode.costTo(neighbor);
                if (!costMap.has(neighbor) || newCost < costMap.get(neighbor)) {
                    costMap.set(neighbor, newCost);
                    parentMap.set(neighbor, currNode);
                    const totalCost = newCost + neighbor.costEstimate(goalNode);
                    queue.enqueue(neighbor, totalCost);
                }
            }
        }*/

        return new NavigationPath(new Stack());

        
    }
    
}