module.exports = class Canvas {

	constructor(client) {
		this.client = client;
	}

	fillBackground(ctx, color) {
		ctx.fillStyle = color;
		const { width, height } = ctx.canvas;
		ctx.fillRect(0, 0, width, height);
	}

	drawRect(ctx, x1, y1, x2, y2, color) {
		ctx.fillStyle = color;
		ctx.fillRect(x1, y1, x2, y2);
	}

	drawCircle(ctx, xcord, ycord, radius, fillStyle, strokeStyle) {
		ctx.beginPath();
		ctx.arc(xcord, ycord, radius, 0, 2 * Math.PI);

		ctx.fillStyle = fillStyle;
		ctx.fill();

		ctx.strokeStyle = strokeStyle;
		ctx.stroke();
	}

	greyScale(ctx, x1, y1, x2, y2) {
		const imageData = ctx.getImageData(x1, y1, x2, y2);

		const pixels = imageData.data;

		for (let j = 0; j < pixels.length; j += 4) {
			const lightness = parseInt((pixels[j] + pixels[j + 1] + pixels[j + 2]) / 3);

			pixels[j] = lightness;
			pixels[j + 1] = lightness;
			pixels[j + 2] = lightness;
		}

		ctx.putImageData(imageData, x1, y1);
	}

};
