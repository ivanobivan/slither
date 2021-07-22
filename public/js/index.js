export default class Slither {
    constructor() {
        this.score = 0;
        this.size = Slither.DEFAULT_SLITHER_SIZE;
        this.direction = Slither.DEFAULT_DIRECTION;
        this.isRunning = false;
        this.headPosition = Slither.DEFAULT_SNAKE_POSITION;
        this.tail = [];
        this.food = Slither.DEFAULT_SNAKE_POSITION;
        this.nextTick = 0;
        this.scoreDom = document.querySelector("#score");
        this.makeCanvasContext = () => {
            const canvas = document.querySelector("canvas");
            canvas.width = Slither.GRID_WIDTH;
            canvas.height = Slither.GRID_HEIGHT;
            return canvas.getContext("2d");
        };
        this.drawCanvasField = () => {
            this.context.fillStyle = "white";
            this.context.beginPath();
            this.context.rect(0, 0, Slither.GRID_WIDTH, Slither.GRID_HEIGHT);
            this.context.fill();
        };
        this.drawGrid = () => {
            this.context.lineWidth = 0.5;
            for (let x = 0; x <= Slither.GRID_WIDTH; x += Slither.BLOCK_SIZE) {
                this.context.beginPath();
                this.context.moveTo(x, 0);
                this.context.lineTo(x, Slither.GRID_HEIGHT);
                this.context.stroke();
            }
            for (let y = 0; y <= Slither.GRID_HEIGHT; y += Slither.BLOCK_SIZE) {
                this.context.beginPath();
                this.context.moveTo(0, y);
                this.context.lineTo(Slither.GRID_WIDTH, y);
                this.context.stroke();
            }
        };
        this.getRandomPosition = (num) => Math.floor(Math.random() * num);
        /*Получаем новые координаты для элемента еды*/
        this.changeFoodPosition = () => {
            const x = this.getRandomPosition(Slither.GRID_X_ELEMENTS);
            const y = this.getRandomPosition(Slither.GRID_Y_ELEMENTS);
            return { x, y };
        };
        /*еду рисуем красного цвета, чтобы выделить визуально*/
        this.drawFood = () => {
            this.context.fillStyle = "red";
            this.context.fillRect(Slither.BLOCK_SIZE * this.food.x, Slither.BLOCK_SIZE * this.food.y, Slither.BLOCK_SIZE, Slither.BLOCK_SIZE);
        };
        this.drawSlither = () => {
            const head = this.headPosition;
            const x = head.x * Slither.BLOCK_SIZE;
            const y = head.y * Slither.BLOCK_SIZE;
            this.context.fillStyle = "black";
            this.context.fillRect(x, y, Slither.BLOCK_SIZE, Slither.BLOCK_SIZE);
            //хвост сделаем светлее, чтобы визуально выделить голову
            this.context.fillStyle = "lightgrey";
            this.tail.forEach(cell => {
                this.context.fillRect(Slither.BLOCK_SIZE * cell.x, Slither.BLOCK_SIZE * cell.y, Slither.BLOCK_SIZE, Slither.BLOCK_SIZE);
            });
        };
        /*метод пересчета координат*/
        this.getNextSlitherPosition = () => {
            const head = this.headPosition;
            switch (this.direction) {
                case 'up':
                    return { x: head.x, y: head.y - 1 };
                case 'down':
                    return { x: head.x, y: head.y + 1 };
                case 'left':
                    return { x: head.x - 1, y: head.y };
                case 'right':
                    return { x: head.x + 1, y: head.y };
                default:
                    return head;
            }
        };
        this.collisionWithBorder = () => {
            const head = this.headPosition;
            return head.x < 0 || head.x >= Slither.GRID_X_ELEMENTS || head.y < 0 || head.y >= Slither.GRID_Y_ELEMENTS;
        };
        this.collisionWithSelf = () => {
            const head = this.headPosition;
            return this.tail.find(el => head.x == el.x && head.y == el.y);
        };
        this.collisionWithFood = () => {
            const head = this.headPosition;
            return this.food.x === head.x && this.food.y === head.y;
        };
        /*Основной метод проверки коллизии элементов*/
        this.checkCollision = () => {
            if (this.collisionWithBorder() || this.collisionWithSelf()) {
                return -1;
            }
            if (this.collisionWithFood()) {
                return 1;
            }
            return 0;
        };
        this.move = () => {
            this.tail.push(this.headPosition);
            this.headPosition = this.getNextSlitherPosition();
            if (this.tail.length > this.size) {
                this.tail.splice(0, 1);
            }
        };
        /*Добавляет змейке звост и очки пользователю*/
        this.grow = () => {
            this.size += 1;
            this.score += Slither.SCORE_STEP;
            this.scoreDom.textContent = this.score.toString();
        };
        /*
        * Метод для смены направления змейки по нажатию
        * Есть проверка для смены направления на противоположное, чтобы не вызвать коллизию с самим собой
        */
        this.changeDirection = (newDirection) => {
            if (this.direction === "up" && newDirection === "down") {
                return;
            }
            if (this.direction === "down" && newDirection === "up") {
                return;
            }
            if (this.direction === "left" && newDirection === "right") {
                return;
            }
            if (this.direction === "right" && newDirection === "left") {
                return;
            }
            this.direction = newDirection;
        };
        this.start = () => {
            if (this.isRunning) {
                return;
            }
            this.isRunning = true;
            requestAnimationFrame(this.animate.bind(this));
        };
        this.stop = () => {
            this.isRunning = false;
            location.reload();
        };
        /*Создаем canvas-элемент*/
        this.context = this.makeCanvasContext();
        /*Заполняем canvas-элемент*/
        this.drawCanvasField();
        /*Рисуем сетку в соответствии с настройками*/
        this.drawGrid();
        /*Определим новые координаты для элемента еды*/
        this.food = this.changeFoodPosition();
        /*Отрисуем его*/
        this.drawFood();
        /*Рисуем элемент змейка*/
        this.drawSlither();
    }
    /*Основной анимирующий метод, перерисовывает сетку в зависимости от скорости анимации*/
    animate(timestamp) {
        if (this.isRunning) {
            requestAnimationFrame(this.animate.bind(this));
            if (timestamp >= this.nextTick) {
                this.nextTick = timestamp + Slither.SPEED;
                this.move();
                const collisionIndex = this.checkCollision();
                /*
                * Проверка на коллизии с другими объектами
                * если есть коллизия со стенкой или с хвостом, то игра окончена
                * если есть коллизия с элементом еды, то добавляем 1 очко
                * если нет коллизий, то ничего не делаем, просто перерисовываем
                */
                if (collisionIndex === -1) {
                    alert(`Congrats, your score is ${this.score}`);
                    this.stop();
                }
                else if (collisionIndex === 1) {
                    this.grow();
                    this.food = this.changeFoodPosition();
                }
                this.drawCanvasField();
                this.drawGrid();
                this.drawFood();
                this.drawSlither();
            }
        }
    }
}
Slither.GRID_HEIGHT = 600;
Slither.GRID_WIDTH = 600;
Slither.BLOCK_SIZE = 20;
Slither.GRID_Y_ELEMENTS = Slither.GRID_HEIGHT / Slither.BLOCK_SIZE;
Slither.GRID_X_ELEMENTS = Slither.GRID_WIDTH / Slither.BLOCK_SIZE;
Slither.SCORE_STEP = 1;
Slither.DEFAULT_SNAKE_POSITION = { x: 3, y: 1 };
Slither.DEFAULT_DIRECTION = "right";
Slither.DEFAULT_SLITHER_SIZE = 3;
Slither.SPEED = 50;
