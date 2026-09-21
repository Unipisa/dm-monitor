import QRCode from 'qrcode';

export class QRCodePage {
    constructor({ start, end, test, title, url, iconUrl, priority, duration = 20000 }) {
        this.test = test;
        this.title = title || "Scansiona il codice QR";
        this.url = url;
        this.iconUrl = iconUrl;
        this.priorityProp = priority || 0.2;
        this.durationMs = duration;
        this.start_moment = start ? moment.tz(start, "Europe/Rome").unix() : null;
        this.end_moment = end ? moment.tz(end, "Europe/Rome").unix() : null;
        this.div = null;
    }

    html() {
        return `
<h1 class="text-center text-primary mt-5" style="font-size: 3rem;">${this.title}</h1>            <div class="row justify-content-center align-items-center mt-4">
                <div class="col-auto text-center">
                    <canvas class="qrcode-canvas"></canvas>
                </div>
            </div>
        `;
    }

    start() {
        if (this.div) {
            throw Error('reentrant call!');
        }

        this.div = document.createElement('div');
        this.div.className = 'qrcode';
        this.div.innerHTML = this.html();
        document.body.appendChild(this.div);

        const canvas = this.div.querySelector('.qrcode-canvas');
        if (canvas) {
            this.renderQRCode(canvas);
        }

        $(this.div).fadeIn();
    }

    renderQRCode(canvas) {
        QRCode.toCanvas(canvas, this.url, {
            width: 600, 
            margin: 2,
            errorCorrectionLevel: 'H',
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        }, (error) => {
            if (error) {
                console.error('Errore generazione QR Code:', error);
                return;
            }

            if (this.iconUrl) {
                this.drawCenterIcon(canvas, this.iconUrl);
            }
        });
    }

    drawCenterIcon(canvas, iconUrl) {
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            const iconSize = canvas.width * 0.22;
            const x = (canvas.width - iconSize) / 2;
            const y = (canvas.height - iconSize) / 2;
            const padding = 8;

            ctx.fillStyle = '#FFFFFF';
            this.drawRoundedRect(
                ctx,
                x - padding / 2,
                y - padding / 2,
                iconSize + padding,
                iconSize + padding,
                6
            );
            ctx.fill();

            ctx.drawImage(img, x, y, iconSize, iconSize);
        };

        img.src = iconUrl;
    }

    drawRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + width, y, x + width, y + height, radius);
        ctx.arcTo(x + width, y + height, x, y + height, radius);
        ctx.arcTo(x, y + height, x, y);
        ctx.arcTo(x, y, x + width, y, radius);
        ctx.closePath();
    }

    stop(callback) {
        $(this.div).fadeOut(500, () => {
            if (this.div) {
                this.div.remove();
                this.div = null;
            }
            if (callback) callback();
        });
    }

    duration() {
        return this.durationMs;
    }

    priority() {
        if (this.test) return 1;
        return this.priorityProp;
    }
}