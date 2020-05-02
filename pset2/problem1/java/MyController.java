public class MyController implements Controller {
	
	public MyController() {
		
	}
	
	@Override
	public void control(IntRef myi, IntRef myj, int[][] obstacles, int[] goal) {
//		System.out.println(myi.i + ", " + myj.i);
		
		if (condAssign(myi, myj, rect(goal[0] - myi.i), rect(goal[1] - myj.i), obstacles))
			return;
		
		// you'll never get to the point where you're only below the object?
		//if (condAssign(myi, myj, rect(myj.i), rect(goal[0] + myj.i), obstacles))
		if (condAssign(myi, myj, 0, 1, obstacles))
			return;

		if (condAssign(myi, myj, 1, 1, obstacles))
			return;
		
		assert false : "should never get here";
	}
	
	private int rect(int x) {
		return Agent.rect(x);
	}
	
	private boolean condAssign(IntRef myi, IntRef myj, int xmove, int ymove, int[][] obstacles) {
//		if (xmove == 0 && ymove == 0)
//			return false;
		
		if (Agent.noCollisions(obstacles, myi.i + xmove, myj.i + ymove)) {
			myi.i += xmove;
			myj.i += ymove;
			assert Agent.inBounds(myi.i, myj.i) : "out of bounds: " + ", " + myi.i + ", " + myj.i + ymove;
			return true;
		}
		return false;
	}
	
}
