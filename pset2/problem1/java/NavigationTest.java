import static org.junit.Assert.*;

import java.util.Arrays;

import org.junit.Test;

public class NavigationTest {

	public static void testController(Controller c, int[][] obstacles, int[] goal) {
		System.out.println("new test: " + Arrays.deepToString(obstacles) + ", " + Arrays.toString(goal));
		Agent a = new Agent(c);
		boolean succeeded = a.navigate(obstacles, goal);
		System.out.println(Arrays.deepToString((a.moves)));
		assertTrue(succeeded);
	}
	
	public void testField(int[][] obstacles, int[] goal) {
		testController(new MyController(), obstacles, goal);
	}
	
	@Test
	public void field1Test() {
		int[][] obstacles = {{1, 1}, {3, 3}, {7,6}};
		int[] goal = {7, 7};
		testField(obstacles, goal);
	}

	@Test
	public void field2Test() {
		int[][] obstacles = {{3, 0}};
		int[] goal = {5, 0};
		testField(obstacles, goal);
	}
	
	@Test
	public void field3Test() {
		int[][] obstacles = {{0, 2}, {1, 5}};
		int[] goal = {0, 6};
		testField(obstacles, goal);
	}
	
	@Test
	public void field4Test() {
		int[][] obstacles = {{2, 2}};
		int[] goal = {6, 5};
		testField(obstacles, goal);
	}
	
}
