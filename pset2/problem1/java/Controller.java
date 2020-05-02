
public interface Controller {
	public void control(IntRef myi, IntRef myj, int[][] obstacles, int[] goal);
	
	public static boolean collision(int i, int j, int i2, int j2) {
		return i == i2 && j == j2;
	}
}
