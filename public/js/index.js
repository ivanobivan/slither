export default class Slither {
    constructor() {
        this.direction = "right";
        this.headPosition = Slither.INITIAL_HEAD;
        this.foodPosition = Slither.DEFAULT_FOOD;
        this.score = 0;
        this.getSlitherDOM = () => document.querySelector("#slither");
        this.getCell = (x, y) => {
            const slitherDOM = this.getSlitherDOM();
            if (slitherDOM) {
                const yDOM = slitherDOM.children[y];
                return yDOM.children[x];
            }
            return null;
        };
        this.makeGrid = () => {
            const slitherDOM = this.getSlitherDOM();
            for (let i = 0; i < Slither.Y_COUNT; i++) {
                const yDOM = document.createElement("div");
                yDOM.className = "y";
                for (let j = 0; j < Slither.X_COUNT; j++) {
                    const xDOM = document.createElement("div");
                    xDOM.className = "x";
                    yDOM.append(xDOM);
                }
                slitherDOM.append(yDOM);
            }
        };
        this.placeHead = (newHead) => {
            const head = this.getCell(newHead.x, newHead.y);
            if (head) {
                head.classList.add("head");
            }
        };
        this.clearHead = (oldHead) => {
            const head = this.getCell(oldHead.x, oldHead.y);
            if (head) {
                head.classList.remove("head");
            }
        };
        this.placeFood = (foodPlace) => {
            const food = this.getCell(foodPlace.x, foodPlace.y);
            if (food) {
                food.classList.add("food");
            }
        };
        this.cleanFood = (oldFood) => {
            const food = this.getCell(oldFood.x, oldFood.y);
            if (food) {
                food.classList.remove("food");
            }
        };
        this.move = () => {
            const oldCoords = Object.assign({}, this.headPosition);
            if (this.direction === "right") {
                this.headPosition = { x: this.headPosition.x + 1, y: this.headPosition.y };
                if (this.headPosition.x >= 8) {
                    return false;
                }
            }
            else if (this.direction === "down") {
                this.headPosition = { x: this.headPosition.x, y: this.headPosition.y + 1 };
                if (this.headPosition.y >= 8) {
                    return false;
                }
            }
            else if (this.direction === "left") {
                this.headPosition = { x: this.headPosition.x - 1, y: this.headPosition.y };
                if (this.headPosition.x < 0) {
                    return false;
                }
            }
            else if (this.direction === "up") {
                this.headPosition = { x: this.headPosition.x, y: this.headPosition.y - 1 };
                if (this.headPosition.y < 0) {
                    return false;
                }
            }
            this.paint(oldCoords);
            this.checkCollision();
            this.updateScore();
            return true;
        };
        this.getRandom = () => Math.floor(Math.random() * Slither.GRID_FACTOR);
        this.calculateNewFood = () => {
            const x = this.getRandom();
            const y = this.getRandom();
            if (this.headPosition.x === x && this.headPosition.y === y) {
                return this.calculateNewFood();
            }
            return { x, y };
        };
        this.checkCollision = () => {
            if (this.foodPosition.x === this.headPosition.x &&
                this.foodPosition.y === this.headPosition.y) {
                this.cleanFood(this.foodPosition);
                const newCoords = this.calculateNewFood();
                this.placeFood(newCoords);
                this.foodPosition = newCoords;
                this.score += Slither.SCORE_STEP;
            }
        };
        this.paint = (oldHead) => {
            this.placeHead(this.headPosition);
            this.clearHead(oldHead);
        };
        this.updateScore = () => {
            const score = document.querySelector("#score span");
            if (score) {
                score.textContent = this.score.toString();
            }
        };
        this.changeDirection = (direction) => {
            this.direction = direction;
        };
        this.start = () => {
            this.placeFood(Slither.DEFAULT_FOOD);
            const timer = setInterval(() => {
                const proceed = this.move();
                if (!proceed) {
                    clearInterval(timer);
                    this.stop();
                }
            }, 200);
        };
        this.stop = () => {
            alert(`Game Over, Score: ${this.score}`);
            location.reload();
        };
        this.makeGrid();
        this.placeHead(Slither.INITIAL_HEAD);
    }
}
Slither.GRID_FACTOR = 8;
Slither.X_COUNT = Slither.GRID_FACTOR;
Slither.Y_COUNT = Slither.GRID_FACTOR;
Slither.INITIAL_HEAD = { x: 0, y: 0 };
Slither.DEFAULT_FOOD = { x: 4, y: 3 };
Slither.SCORE_STEP = 1;
