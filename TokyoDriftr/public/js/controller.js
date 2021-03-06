
export class keyboardControls{
	constructor(){
		var self = this
		this.accelerate = false
		this.brake = false
		this.turning = false

		this.left = false
		this.right = false

		this.r = false

		this.turnDirection = 0 //float. 1=left, -1=right.
		document.addEventListener("keydown", onDocumentKeyDown, false);
		document.addEventListener("keyup", onDocumentKeyUp, false);

		function onDocumentKeyDown(event) {
			var key = event.key;
			if (key == "w" || key == "W" || key == "ArrowUp") {
				self.accelerate = true
			} else if (key == "a" || key == "A" || key == "ArrowLeft") {
				self.turning = !self.turning
				self.left = true
				self.checkTurn()
			} else if (key == "d" || key == "D" || key == "ArrowRight") {
				self.turning = !self.turning
				self.right = true
				self.checkTurn()
			} else if (key == "s" || key == "S" ||key == "ArrowDown" || key == " ") {
				self.brake = true
			} else if (key == "r") {
				self.r = true
			}
		}function onDocumentKeyUp(event) {
			var key = event.key;
			if (key == "w" || key == "ArrowUp") {
				self.accelerate = false
			} else if (key == "a" || key == "ArrowLeft") {
				self.turning = !self.turning
				self.left = false
				self.checkTurn()
			} else if (key == "d" || key == "ArrowRight") {
				self.turning = !self.turning
				self.right = false
				self.checkTurn()
			} else if (key == "s" || key == "ArrowDown" || key == " ") {
				self.brake = false
			} else if (key == "r") {
				self.r = false
			}
		}
	}
	checkTurn(){
		this.turning = this.left ^ this.right
		if(!this.turning) this.turnDirection = 0
		else if(this.left) this.turnDirection = 1
		else this.turnDirection = -1
	}
}