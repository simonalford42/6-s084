import java.util.Arrays;
import java.util.Random;

public class Agent {
	private final Controller c;
	
	public int[][] moves;
	
	public static final int MAX_STEPS = 24; 
	
	public Agent(Controller c) {
		this.c = c;
	}
	
	public boolean navigate(int[][] obstacles, int[] goal) {
		moves = new int[MAX_STEPS][2];
		
		IntRef myi = new IntRef(0);
		IntRef myj = new IntRef(0);
		
		for (int i = 0; i < MAX_STEPS; i ++) {
			int prevI = myi.i;
			int prevJ = myj.i;
			c.control(myi, myj, obstacles, goal);
			moves[i][0] = myi.i;
			moves[i][1] = myj.i;
			assert Math.abs(myi.i - prevI) <= 1 && Math.abs(myj.i - prevJ) <= 1 : "moved too far: " + myi.i + ", " + myj.i + "; prev:  " + prevI + ", " + prevJ;
			assert noCollisions(obstacles, myi.i, myj.i) : "collision: " + Arrays.deepToString(obstacles) + ", " + myi.i + ", " + myj.i;
			assert inBounds(myi.i, myj.i);
		}
		
		return myi.i == goal[0] && myj.i == goal[1];
	}
	
	public static boolean noCollisions(int[][] obstacles, int myi, int myj) {
		for (int i = 0; i < obstacles.length; i++) {
			if (obstacles[i][0] == myi && obstacles[i][1] == myj) {
				return false;
			}
		}
		return true;
	}
	
	public static boolean inBounds(int i, int j) {
		return (i >= 0 && i < 8 && j >= 0 && j < 8); 
	}
	
	public static int rect(int x) {
		if (x > 0) {
			return 1;
		}
		if (x < 0) {
			return -1;
		}
		return 0;
	}
	
	public void findCounterexample() {
		int numTests = 100000;
		for (int numObstacles = 1; numObstacles < 9; numObstacles++) {
			System.out.println("numObstacles: " + numObstacles);
			for (int i = 0; i < numTests; i++) {
//				System.out.println("test " + i);
				int[] goal = generateGoal();
				int[][] obstacles = generateObstacles(goal, numObstacles);
				
				boolean success = this.navigate(obstacles, goal);
				if (!success) {
					System.out.println("failure at step " + i + ": goal= " + Arrays.toString(goal));
					System.out.println("obstacles: " + Arrays.deepToString(obstacles));
					System.out.println("path: " + Arrays.deepToString(moves));
					return;
				}
			}
		}
	}
	
	public static int[] randomPoint() {
		Random r = new Random();
		int i = r.nextInt(8);
		int j = r.nextInt(8);
		int[] goal = {i, j};
		return goal;
	}

	public static int[] generateGoal() {
		int[] i = randomPoint();
//		if (new Random().nextBoolean()) {
//			i[0] = 0;
//		} else {
//			i[1] = 0;
//		}
		return i;
	}
	
	public static int[][] generateObstacles(int[] goal, int numObstacles) {
		int[][] obstacles = new int[8][2];
		int n = 0;
		final int steps = 1000;
		final int maxObstacles = numObstacles;
		for (int i = 0; i < steps; i++) {
			int[] randomPoint = randomPoint();
			if (!Arrays.equals(randomPoint, goal) && 
					!conflict(obstacles, randomPoint[0], randomPoint[1])) {
				obstacles[n] = randomPoint;
				n += 1;
			}
			if (n == maxObstacles)
				break;
		}
//		System.out.println(n + " obstacles found");
		return Arrays.copyOfRange(obstacles, 0, n);
	}
	
	public static boolean conflict(int[][] obstacles, int i, int j) {
		for (int k = 0; k < obstacles.length; k++) {
			int x1 = obstacles[k][0];
			int y1 = obstacles[k][1];
			if (manhattan(x1, y1, i, j) <= 3)
				return true;
		}
		return false;
	}
	
	public static int manhattan(int x1, int y1, int x2, int y2) {
		return Math.abs(x2 - x1) + Math.abs(y2 - y1);
	}
	
	public static void main(String[] args) {
		Agent a = new Agent(new MyController());
		a.findCounterexample();
	}
}
