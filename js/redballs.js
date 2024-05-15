const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        const speedSlider = document.getElementById('speedSlider');
        const sizeSlider = document.getElementById('sizeSlider');
        const addBallButton = document.getElementById('addBall');
        const removeBallButton = document.getElementById('removeBall');

        let width = window.innerWidth;
        let height = window.innerHeight - 60; // Adjust for controls
        canvas.width = width;
        canvas.height = height;

        let balls = [
            {
                x: width / 2,
                y: height / 2,
                radius: 20,
                dx: 2,
                dy: 2,
                color: 'red'
            },
            {
                x: width / 3,
                y: height / 3,
                radius: 20,
                dx: -2,
                dy: -2,
                color: 'red'
            }
        ];

        let speed = 5;
        let friction = parseFloat(frictionSlider.value); // Default friction from the slider

        speedSlider.addEventListener('input', (e) => {
            speed = e.target.value;
        });

        sizeSlider.addEventListener('input', (e) => {
            const newSize = e.target.value;
            balls.forEach(ball => ball.radius = parseInt(newSize));
        });

        frictionSlider.addEventListener('input', (e) => {
            friction = parseFloat(e.target.value);
        });

        addBallButton.addEventListener('click', () => {
            let dx = (Math.random() * 4 - 2) || 1; // Ensure dx is not zero
            let dy = (Math.random() * 4 - 2) || 1; // Ensure dy is not zero

            balls.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: parseInt(sizeSlider.value),
                dx: dx,
                dy: dy,
                color: 'red'
            });
        });

        removeBallButton.addEventListener('click', () => {
            if (balls.length > 1) {
                balls.pop();
            }
        });

        function drawBall(ball) {
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fillStyle = ball.color;
            ctx.fill();
            ctx.closePath();
        }

        function updateBall(ball) {

            ball.x += ball.dx * speed;
            ball.y += ball.dy * speed;

            // Apply friction
            ball.dx *= (1-friction);
            ball.dy *= (1-friction);

            // Bounce off walls
            if (ball.x + ball.radius > width || ball.x - ball.radius < 0) {
                ball.dx *= -1;
            }

            if (ball.y + ball.radius > height || ball.y - ball.radius < 0) {
                ball.dy *= -1;
            }
        }

        function detectCollisions() {
            for (let i = 0; i < balls.length; i++) {
                for (let j = i + 1; j < balls.length; j++) {
                    const dx = balls[j].x - balls[i].x;
                    const dy = balls[j].y - balls[i].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const minDistance = balls[i].radius + balls[j].radius;

                    if (distance < minDistance) {
                        // Calculate the angle of the collision
                        const angle = Math.atan2(dy, dx);

                        // Calculate new velocities based on the collision
                        const u1 = rotate({ x: balls[i].dx, y: balls[i].dy }, angle);
                        const u2 = rotate({ x: balls[j].dx, y: balls[j].dy }, angle);

                        // Swap velocities for elastic collision
                        const v1 = { x: u2.x, y: u1.y };
                        const v2 = { x: u1.x, y: u2.y };

                        // Rotate velocities back
                        const finalV1 = rotate(v1, -angle);
                        const finalV2 = rotate(v2, -angle);

                        // Apply new velocities
                        balls[i].dx = finalV1.x;
                        balls[i].dy = finalV1.y;
                        balls[j].dx = finalV2.x;
                        balls[j].dy = finalV2.y;

                        // Move balls apart to avoid overlap
                        const overlap = (minDistance - distance) / 2;
                        balls[i].x -= Math.cos(angle) * overlap;
                        balls[i].y -= Math.sin(angle) * overlap;
                        balls[j].x += Math.cos(angle) * overlap;
                        balls[j].y += Math.sin(angle) * overlap;

                        // Ensure balls are not pushed outside the canvas bounds
                        if (balls[i].x - balls[i].radius < 0) balls[i].x = balls[i].radius;
                        if (balls[i].x + balls[i].radius > width) balls[i].x = width - balls[i].radius;
                        if (balls[i].y - balls[i].radius < 0) balls[i].y = balls[i].radius;
                        if (balls[i].y + balls[i].radius > height) balls[i].y = height - balls[i].radius;

                        if (balls[j].x - balls[j].radius < 0) balls[j].x = balls[j].radius;
                        if (balls[j].x + balls[j].radius > width) balls[j].x = width - balls[j].radius;
                        if (balls[j].y - balls[j].radius < 0) balls[j].y = balls[j].radius;
                        if (balls[j].y + balls[j].radius > height) balls[j].y = height - balls[j].radius;
                    }
                }
            }
        }

        function applyGravity() {
            const G = 1; // Further increased gravitational constant

            for (let i = 0; i < balls.length; i++) {
                for (let j = i + 1; j < balls.length; j++) {
                    const dx = balls[j].x - balls[i].x;
                    const dy = balls[j].y - balls[i].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance > 0) {
                        const force = G * (balls[i].radius * balls[j].radius) / (distance * distance);
                        const ax = force * dx / distance;
                        const ay = force * dy / distance;

                        balls[i].dx += ax;
                        balls[i].dy += ay;
                        balls[j].dx -= ax;
                        balls[j].dy -= ay;
                    }
                }
            }
        }

        function rotate(velocity, angle) {
            return {
                x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
                y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
            };
        }

        function clearCanvas() {
            ctx.clearRect(0, 0, width, height);
        }

        function animate() {
            clearCanvas();
            balls.forEach(ball => {
                drawBall(ball);
                updateBall(ball);
            });
            detectCollisions();
            applyGravity();
            requestAnimationFrame(animate);
        }

        animate();

        window.addEventListener('resize', () => {
            width = window.innerWidth;
            height = window.innerHeight - 60; // Adjust for controls
            canvas.width = width;
            canvas.height = height;
        });