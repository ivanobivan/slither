type coords = { x: number, y: number };

export default class Slither {
    private static GRID_FACTOR = 8;
    private static X_COUNT = Slither.GRID_FACTOR;
    private static Y_COUNT = Slither.GRID_FACTOR;
    private static INITIAL_HEAD = {x: 0, y: 0};
    private static DEFAULT_FOOD = {x: 4, y: 3};
    private static SCORE_STEP = 1;
    private direction: string = "right";
    private headPosition = Slither.INITIAL_HEAD;
    private foodPosition = Slither.DEFAULT_FOOD;
    private score = 0;

    constructor() {
        this.makeGrid();
        this.placeHead(Slither.INITIAL_HEAD);
    }

    private getSlitherDOM = () => document.querySelector("#slither");

    private getCell = (x: number, y: number) => {
        const slitherDOM = this.getSlitherDOM();
        if (slitherDOM) {
            const yDOM = slitherDOM.children[y];
            return yDOM.children[x];
        }
        return null;
    }

    private makeGrid = () => {
        const slitherDOM = this.getSlitherDOM()
        for (let i = 0; i < Slither.Y_COUNT; i++) {
            const yDOM = document.createElement("div");
            yDOM.className = "y";
            for (let j = 0; j < Slither.X_COUNT; j++) {
                const xDOM = document.createElement("div");
                xDOM.className = "x";
                yDOM.append(xDOM);
            }
            (slitherDOM as Element).append(yDOM);
        }
    }

    private placeHead = (newHead: coords) => {
        const head = this.getCell(newHead.x, newHead.y);
        if (head) {
            head.classList.add("head");
        }
    }

    private clearHead = (oldHead: coords) => {
        const head = this.getCell(oldHead.x, oldHead.y);
        if (head) {
            head.classList.remove("head");
        }
    }

    private placeFood = (foodPlace: coords) => {
        const food = this.getCell(foodPlace.x, foodPlace.y);
        if (food) {
            food.classList.add("food");
        }
    }

    private cleanFood = (oldFood: coords) => {
        const food = this.getCell(oldFood.x, oldFood.y);
        if (food) {
            food.classList.remove("food");
        }
    }

    private move = (): boolean => {
        const oldCoords = Object.assign({}, this.headPosition);
        if (this.direction === "right") {
            this.headPosition = {x: this.headPosition.x + 1, y: this.headPosition.y};
            if (this.headPosition.x >= 8) {
                return false;
            }
        } else if (this.direction === "down") {
            this.headPosition = {x: this.headPosition.x, y: this.headPosition.y + 1};
            if (this.headPosition.y >= 8) {
                return false;
            }
        } else if (this.direction === "left") {
            this.headPosition = {x: this.headPosition.x - 1, y: this.headPosition.y};
            if (this.headPosition.x < 0) {
                return false;
            }
        } else if (this.direction === "up") {
            this.headPosition = {x: this.headPosition.x, y: this.headPosition.y - 1};
            if (this.headPosition.y < 0) {
                return false;
            }
        }
        this.paint(oldCoords);
        this.checkCollision();
        this.updateScore();
        return true;
    }

    private getRandom = () => Math.floor(Math.random() * Slither.GRID_FACTOR);

    private calculateNewFood = (): coords => {
        const x = this.getRandom();
        const y = this.getRandom();
        if (this.headPosition.x === x && this.headPosition.y === y) {
            return this.calculateNewFood();
        }
        return {x, y};
    }

    private checkCollision = () => {
        if (this.foodPosition.x === this.headPosition.x &&
            this.foodPosition.y === this.headPosition.y
        ) {
            this.cleanFood(this.foodPosition);
            const newCoords = this.calculateNewFood();
            this.placeFood(newCoords);
            this.foodPosition = newCoords;
            this.score += Slither.SCORE_STEP;
        }
    }

    private paint = (oldHead: coords) => {
        this.placeHead(this.headPosition);
        this.clearHead(oldHead);
    }

    private updateScore = () => {
        const score = document.querySelector("#score span");
        if(score) {
            score.textContent = this.score.toString();
        }
    }

    public changeDirection = (direction: string) => {
        this.direction = direction;
    }

    public start = () => {
        this.placeFood(Slither.DEFAULT_FOOD);
        const timer = setInterval(() => {
            const proceed = this.move();
            if (!proceed) {
                clearInterval(timer);
                this.stop();
            }
        }, 200);

    }

    public stop = () => {
        alert(`Game Over, Score: ${this.score}`);
        location.reload();
    }
}