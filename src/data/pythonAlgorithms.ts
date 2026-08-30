export interface PythonAlgorithm {
  id: string;
  title: string;
  historicalMathematician: string;
  year: string;
  description: string;
  defaultCode: string;
  defaultParams: {
    n?: number;
    alpha?: number;
    slices?: number;
    x?: number;
  };
  sampleOutputNote: string;
}

export const HISTORICAL_PYTHON_ALGORITHMS: PythonAlgorithm[] = [
  {
    id: "archimedes_parabola",
    title: "阿基米德抛物线弓形穷竭求积 (Archimedes Quadrature of Parabola)",
    historicalMathematician: "阿基米德 (Archimedes)",
    year: "公元前240年",
    description: "通过主内接三角形割补与无穷等比级数（公比 1/4）求和，证明抛物线弓形面积严格等于内接主三角形面积的 4/3 倍。",
    defaultParams: { n: 6 },
    sampleOutputNote: "Outputs inscribed triangle area at each step, geometric series sum, error residual, and terminal ASCII parabola chart.",
    defaultCode: `#!/usr/bin/env python3
"""
=============================================================================
Calculus Historical Algorithms: Archimedes' Quadrature of the Parabola (240 BC)
Quadrature of the Parabola by Archimedes of Syracuse

Mathematical Principles:
1. Parabola segment y = 4x(1-x), x in [0, 1], with vertex at C(1/2, 1)
2. Base inscribed triangle T0 with base AB=1, height h=1, Area T0 = 1/2 * 1 * 1 = 0.5
3. In subsequent steps, construct 2 smaller inscribed triangles in each residual segment.
   Area sum of new triangles at step k: T_k = T0 * (1/4)^k
4. Total exhaustion series sum: S = T0 * (1 + 1/4 + 1/16 + ...) = T0 * (4/3)
=============================================================================
"""

import sys
import math

def calculate_parabola_quadrature(max_steps=6, t0_area=1.0):
    print("=" * 70)
    print("ARCHIMEDES' QUADRATURE OF THE PARABOLA BY EXHAUSTION (240 BC)")
    print(f"Base Inscribed Triangle Area T0 = {t0_area:.4f}")
    print(f"Theoretical Exact Limit Area = (4/3) * T0 = {(4/3)*t0_area:.8f}")
    print("=" * 70)
    
    current_sum = 0.0
    exact_limit = (4.0 / 3.0) * t0_area
    
    # Table Header
    print(f"{'Step k':<8}{'Term Expression':<18}{'Added Area':<16}{'Cumulative Area':<16}{'Convergence %':<12}")
    print("-" * 70)
    
    for k in range(max_steps + 1):
        term = t0_area * (0.25 ** k)
        current_sum += term
        ratio = (current_sum / exact_limit) * 100.0
        expr = f"T0 * (1/4)^{k}"
        print(f"{k:<8}{expr:<18}{term:<16.8f}{current_sum:<16.8f}{ratio:<10.4f}%")
        
    abs_error = abs(exact_limit - current_sum)
    print("-" * 70)
    print(f"-> Max Iteration Step k:   {max_steps}")
    print(f"-> Computed Numerical Area: {current_sum:.10f}")
    print(f"-> Exact Theoretical Area:  {exact_limit:.10f}")
    print(f"-> Absolute Residual Error: {abs_error:.4e}")
    
    # Parabola & Triangle ASCII Projection Chart
    print("\\n" + "=" * 70)
    print("PARABOLIC SEGMENT & INSCRIBED TRIANGLE (ASCII 2D PROJECTION)")
    print("=" * 70)
    w = 56
    h = 13
    grid = [[" " for _ in range(w)] for _ in range(h)]
    
    for c in range(w):
        x = c / (w - 1)
        # Parabola y = 4x(1-x)
        y = 4.0 * x * (1.0 - x)
        r = int(round((1.0 - y) * (h - 1)))
        r = max(0, min(h - 1, r))
        grid[r][c] = "#"
        
        # Fill parabolic interior
        for fill_r in range(r + 1, h):
            if grid[fill_r][c] == " ":
                grid[fill_r][c] = "."
                
    # Mark Vertex C and Base Points A, B
    grid[0][w // 2] = "C"
    grid[h - 1][0] = "A"
    grid[h - 1][w - 1] = "B"
    
    for row in grid:
        print("".join(row))
    print(f"A(0.0, 0.0) [Base-L]{' ' * (w - 38)}B(1.0, 0.0) [Base-R]")
    print(f"Legend: '#' = Parabola Boundary | '.' = Inscribed Area | 'C' = Vertex (0.5, 1.0)")
    print("=" * 70)

if __name__ == "__main__":
    n = 6
    if len(sys.argv) > 1:
        try:
            n = int(sys.argv[1])
        except ValueError:
            pass
    calculate_parabola_quadrature(max_steps=n)
`
  },
  {
    id: "leibniz_pi_series",
    title: "莱布尼茨-格里高利交错级数求圆周率 (Leibniz π Series)",
    historicalMathematician: "戈特弗里德·莱布尼茨 (G. W. Leibniz)",
    year: "1674年",
    description: "通过几何圆切片积分导出 arctan(1) 的泰勒交错级数，建立离散奇数倒数与连续圆周率 π 的奇妙等式：1 - 1/3 + 1/5 - 1/7 + ... = π/4。",
    defaultParams: { n: 50 },
    sampleOutputNote: "Outputs alternating series convergence, upper/lower envelope bounds, and ASCII oscillation chart.",
    defaultCode: `#!/usr/bin/env python3
"""
=============================================================================
Calculus Historical Algorithms: Leibniz-Gregory Alternating Series for Pi (1674)
Formula: 1 - 1/3 + 1/5 - 1/7 + 1/9 - ... = pi / 4

Mathematical Principles:
1. Derived from geometric circle slice integral: arctan(1) = int_0^1 (1 / (1 + x^2)) dx
2. Expanded as power series: int_0^1 (1 - x^2 + x^4 - x^6 + ...) dx
3. Integrated term-by-term: pi / 4 = 1 - 1/3 + 1/5 - 1/7 + 1/9 - ...
4. Classic Leibniz Alternating Series test: partial sums oscillate between upper/lower bounds.
=============================================================================
"""

import sys
import math

def calculate_leibniz_pi(num_terms=40):
    print("=" * 70)
    print("LEIBNIZ-GREGORY ALTERNATING SERIES FOR PI (1674)")
    print(f"Target Constants: pi = {math.pi:.10f}, pi/4 = {math.pi/4:.10f}")
    print("=" * 70)
    
    current_sum = 0.0
    print(f"{'Term k':<8}{'Sign / Denom':<16}{'Term Value':<14}{'Cumulative pi/4':<16}{'Approx Pi':<14}{'Abs Error'}")
    print("-" * 70)
    
    history_pi = []
    
    for k in range(num_terms):
        sign = (-1) ** k
        denom = 2 * k + 1
        term = sign / denom
        current_sum += term
        approx_pi = current_sum * 4.0
        err = abs(math.pi - approx_pi)
        history_pi.append(approx_pi)
        
        if k < 10 or k == num_terms - 1 or k % (max(1, num_terms // 8)) == 0:
            sign_str = f"({'+' if sign > 0 else '-'}1)/{denom}"
            print(f"{k:<8}{sign_str:<16}{term:<14.6f}{current_sum:<16.8f}{approx_pi:<14.8f}{err:.6f}")
            
    print("-" * 70)
    print(f"-> Total Number of Terms:  {num_terms}")
    print(f"-> Computed Pi Estimate:   {current_sum * 4.0:.10f}")
    print(f"-> True Mathematical Pi:   {math.pi:.10f}")
    print(f"-> Final Absolute Error:   {abs(math.pi - current_sum * 4.0):.8f}")
    
    # ASCII Plot of Oscillating Convergence
    print("\\n" + "=" * 70)
    print("ALTERNATING SERIES OSCILLATING CONVERGENCE TRAJECTORY (ASCII)")
    print("=" * 70)
    
    plot_terms = min(30, len(history_pi))
    w = 56
    h = 11
    grid = [[" " for _ in range(w)] for _ in range(h)]
    
    min_v = min(history_pi[:plot_terms])
    max_v = max(history_pi[:plot_terms])
    if max_v - min_v < 1e-6:
        max_v += 0.1
        min_v -= 0.1
        
    # Draw reference line for true Pi
    pi_r = int(round((max_v - math.pi) / (max_v - min_v) * (h - 1)))
    if 0 <= pi_r < h:
        for c in range(w):
            grid[pi_r][c] = "-"
            
    for i in range(plot_terms):
        c = int(round(i / (plot_terms - 1) * (w - 1)))
        val = history_pi[i]
        r = int(round((max_v - val) / (max_v - min_v) * (h - 1)))
        r = max(0, min(h - 1, r))
        grid[r][c] = "o" if i % 2 == 0 else "*"
        
    for idx, row in enumerate(grid):
        line_str = "".join(row)
        if idx == pi_r:
            print(line_str + f" <-- True Target Pi ({math.pi:.4f})")
        else:
            print(line_str)
            
    print(f"k=0 {' ' * (w - 18)} k={plot_terms-1}")
    print("Legend: '-' = Target Pi Line | 'o' = Upper Bound | '*' = Lower Bound")
    print("=" * 70)

if __name__ == "__main__":
    n = 50
    if len(sys.argv) > 1:
        try:
            n = int(sys.argv[1])
        except ValueError:
            pass
    calculate_leibniz_pi(num_terms=n)
`
  },
  {
    id: "newton_binomial",
    title: "牛顿广义二项式任意实数指数级数展开 (Newton Generalized Binomial)",
    historicalMathematician: "艾萨克·牛顿 (Sir Isaac Newton)",
    year: "1665年",
    description: "牛顿在瘟疫避静年将二项式定理推广至任意分数与负数指数 (1+x)^α，成为其流数术与微积分方程求解的核心代数引擎。",
    defaultParams: { alpha: 0.5, x: 0.5, n: 6 },
    sampleOutputNote: "Outputs generalized binomial coefficients C(alpha, k), polynomial partial sums, and truncation error.",
    defaultCode: `#!/usr/bin/env python3
"""
=============================================================================
Calculus Historical Algorithms: Newton's Generalized Binomial Theorem (1665)
Newton's Generalized Binomial Theorem: (1 + x)^alpha = sum_{k=0}^infty C(alpha, k) * x^k

Mathematical Principles:
1. Extends classical integer binomial expansion to arbitrary real/fractional exponent alpha.
2. Generalized combination coefficients:
   C(alpha, 0) = 1
   C(alpha, k) = [alpha * (alpha - 1) * (alpha - 2) * ... * (alpha - k + 1)] / k!
3. For |x| < 1, the series converges absolutely, providing key algebraic tool for fractional fluxions.
=============================================================================
"""

import sys
import math

def calculate_newton_binomial(alpha=0.5, x=0.5, terms_count=6):
    print("=" * 72)
    print("NEWTON'S GENERALIZED BINOMIAL EXPANSION ENGINE (1665)")
    print(f"Target Function: f(x) = (1 + x)^({alpha}), Input x = {x}")
    exact_val = (1.0 + x) ** alpha
    print(f"Analytical Exact Value: f({x}) = {exact_val:.10f}")
    print("=" * 72)
    
    current_sum = 0.0
    current_coeff = 1.0
    
    print(f"{'Order k':<8}{'Coeff C(alpha,k)':<20}{'Term Value x^k':<18}{'Partial Sum':<16}{'Residual Error'}")
    print("-" * 72)
    
    for k in range(terms_count):
        if k == 0:
            current_coeff = 1.0
        else:
            current_coeff = (current_coeff * (alpha - k + 1)) / k
            
        term_val = current_coeff * (x ** k)
        current_sum += term_val
        err = abs(exact_val - current_sum)
        
        print(f"{k:<8}{current_coeff:<20.8f}{term_val:<18.8f}{current_sum:<16.8f}{err:.4e}")
        
    print("-" * 72)
    print(f"-> Truncation Order:       {terms_count} terms")
    print(f"-> Series Approximate Sum: {current_sum:.10f}")
    print(f"-> Analytical True Value:  {exact_val:.10f}")
    print(f"-> Final Truncation Error: {abs(exact_val - current_sum):.8e}")
    
    # Symbolic Polynomial String Generation
    print("\\n" + "=" * 72)
    print("NEWTON'S SYMBOLIC ALGEBRAIC POLYNOMIAL EXPANSION")
    poly_terms = []
    c = 1.0
    for k in range(terms_count):
        if k == 0:
            c = 1.0
            poly_terms.append("1")
        else:
            c = (c * (alpha - k + 1)) / k
            sign_str = f"{c:+.5f}"
            poly_terms.append(f"{sign_str} * x^{k}")
            
    print(f"(1 + x)^({alpha}) approx " + " ".join(poly_terms))
    print("=" * 72)

if __name__ == "__main__":
    alpha = 0.5
    x = 0.5
    n = 6
    if len(sys.argv) > 1:
        try:
            alpha = float(sys.argv[1])
        except ValueError:
            pass
    if len(sys.argv) > 2:
        try:
            x = float(sys.argv[2])
        except ValueError:
            pass
    if len(sys.argv) > 3:
        try:
            n = int(sys.argv[3])
        except ValueError:
            pass
    calculate_newton_binomial(alpha=alpha, x=x, terms_count=n)
`
  },
  {
    id: "riemann_slicing",
    title: "古法矩形割补与黎曼积分和 (Riemann Slicing & Quadrature)",
    historicalMathematician: "伯恩哈德·黎曼 (Bernhard Riemann)",
    year: "1854年",
    description: "通过达布上和、下和与梯形法则对曲线 y = x² 在区间 [0, 1] 实施紧致切片逼近，演示切片厚度 Δx -> 0 时连续定积分的收敛性。",
    defaultParams: { slices: 24 },
    sampleOutputNote: "Outputs Left Riemann Sum, Right Riemann Sum, Trapezoid Rule, and ASCII partition slices chart.",
    defaultCode: `#!/usr/bin/env python3
"""
=============================================================================
Calculus Historical Algorithms: Riemann Sums & Quadrature Slicing (1854)
Riemann Integral: int_0^1 x^2 dx = lim_{n->infty} sum f(xi_i) * Delta x = 1/3

Mathematical Principles:
1. Divide interval [0, 1] into n sub-intervals with uniform step Delta x = 1/n.
2. Left Riemann Sum:  L_n = sum_{i=0}^{n-1} (x_i)^2 * Delta x (Lower Darboux Sum)
3. Right Riemann Sum: R_n = sum_{i=1}^n     (x_i)^2 * Delta x (Upper Darboux Sum)
4. Trapezoidal Rule:  T_n = (L_n + R_n) / 2
5. Squeeze theorem: as Delta x -> 0, L_n and R_n squeeze and converge to true integral 1/3.
=============================================================================
"""

import sys
import math

def calculate_riemann_integral(n_slices=24):
    print("=" * 72)
    print("RIEMANN INTEGRAL SUMS & QUADRATURE FOR y = x^2 ON [0, 1] (1854)")
    print(f"Exact Analytical Integral: int_0^1 x^2 dx = [x^3/3]_0^1 = 1/3 = {1.0/3.0:.10f}")
    print("=" * 72)
    
    dx = 1.0 / n_slices
    left_sum = 0.0
    right_sum = 0.0
    mid_sum = 0.0
    
    for i in range(n_slices):
        x_left = i * dx
        x_right = (i + 1) * dx
        x_mid = (x_left + x_right) / 2.0
        
        y_left = x_left ** 2
        y_right = x_right ** 2
        y_mid = x_mid ** 2
        
        left_sum += y_left * dx
        right_sum += y_right * dx
        mid_sum += y_mid * dx
        
    trap_sum = (left_sum + right_sum) / 2.0
    exact = 1.0 / 3.0
    
    print(f"Partition Slices N = {n_slices}, Slice Width Delta x = {dx:.6f}")
    print("-" * 72)
    print(f"{'Quadrature Method':<22}{'Numerical Sum':<18}{'Exact Value':<16}{'Absolute Error'}")
    print("-" * 72)
    print(f"{'Left Riemann Sum':<22}{left_sum:<18.8f}{exact:<16.8f}{abs(exact - left_sum):.6e}")
    print(f"{'Right Riemann Sum':<22}{right_sum:<18.8f}{exact:<16.8f}{abs(exact - right_sum):.6e}")
    print(f"{'Trapezoidal Rule':<22}{trap_sum:<18.8f}{exact:<16.8f}{abs(exact - trap_sum):.6e}")
    print(f"{'Midpoint Rule':<22}{mid_sum:<18.8f}{exact:<16.8f}{abs(exact - mid_sum):.6e}")
    print("-" * 72)
    print(f"-> Darboux Squeeze Interval: [{left_sum:.6f}, {right_sum:.6f}] containing true limit 1/3 (0.333333)")
    
    # ASCII 2D Projection Chart of Slices
    print("\\n" + "=" * 72)
    print("RIEMANN PARTITION BAR SLICES y = x^2 (ASCII 2D PROJECTION)")
    print("=" * 72)
    w = 52
    h = 12
    grid = [[" " for _ in range(w)] for _ in range(h)]
    
    for c in range(w):
        x = c / (w - 1)
        y = x ** 2
        r = int(round((1.0 - y) * (h - 1)))
        r = max(0, min(h - 1, r))
        grid[r][c] = "#"
        
        # Fill slice area underneath
        for fill_r in range(r + 1, h):
            grid[fill_r][c] = ":"
            
    for row in grid:
        print("".join(row))
    print(f"(0.0, 0.0) [Origin]{' ' * (w - 38)}(1.0, 1.0) [Interval End]")
    print(f"Legend: '#' = Curve y = x^2 | ':' = Integrated Area Slices Under Curve")
    print("=" * 72)

if __name__ == "__main__":
    slices = 24
    if len(sys.argv) > 1:
        try:
            slices = int(sys.argv[1])
        except ValueError:
            pass
    calculate_riemann_integral(n_slices=slices)
`
  },
  {
    id: "fermat_adequality",
    title: "费马伪等法与多项式驻点极值 (Fermat Adequality Method)",
    historicalMathematician: "皮埃尔·德·费马 (Pierre de Fermat)",
    year: "1636年",
    description: "引入微扰量 e 建立近似伪等式 f(x+e) ≈ f(x)，消去同类项并除以 e，最后令 e=0 求得极值驻点与切线斜率。",
    defaultParams: { x: 50 },
    sampleOutputNote: "Demonstrates polynomial extremum discovery via Fermat's adequality, perturbation e elimination, and critical stationary point detection.",
    defaultCode: `#!/usr/bin/env python3
"""
=============================================================================
Calculus Historical Algorithms: Fermat's Method of Adequality (1636)
Fermat's Method of Adequality for Maxima and Minima

Mathematical Principles:
1. Classical Geometric Optimization: Divide length B into two segments x and (B - x).
   Maximize rectangle area A(x) = x * (B - x).
2. Fermat introduces infinitesimal perturbation e, setting A(x+e) "adequal" to A(x):
   (x + e) * (B - x - e) =_adequal x * (B - x)
3. Expand polynomial products:
   B*x - x^2 + B*e - 2*x*e - e^2 =_adequal B*x - x^2
4. Subtract common terms (B*x - x^2):
   B*e - 2*x*e - e^2 =_adequal 0
5. Divide by non-zero perturbation e:
   B - 2*x - e =_adequal 0
6. Set e = 0 to yield exact stationary maximum:
   B - 2*x = 0  =>  x* = B / 2
=============================================================================
"""

import sys

def calculate_fermat_adequality(total_b=100.0, step_e=0.001):
    print("=" * 72)
    print("FERMAT'S ADEQUALITY METHOD FOR EXTREMUM & STATIONARY POINTS (1636)")
    print(f"Total Segment Length B = {total_b:.2f}, Perturbation Parameter e = {step_e}")
    print("=" * 72)
    
    exact_optimal_x = total_b / 2.0
    max_area = exact_optimal_x * (total_b - exact_optimal_x)
    
    print(f"Theoretical Stationary Point: x* = B / 2 = {exact_optimal_x:.4f}")
    print(f"Maximum Rectangle Area:      A(x*) = {max_area:.4f}")
    print("-" * 72)
    print(f"{'Sample x':<10}{'Area A(x)':<16}{'Perturbed A(x+e)':<18}{'Quotient dA/e':<18}{'Stationary State'}")
    print("-" * 72)
    
    sample_points = [
        total_b * 0.2,
        total_b * 0.35,
        total_b * 0.45,
        exact_optimal_x,
        total_b * 0.55,
        total_b * 0.7,
        total_b * 0.85
    ]
    
    for x in sample_points:
        a_x = x * (total_b - x)
        a_xe = (x + step_e) * (total_b - (x + step_e))
        diff_quotient = (a_xe - a_x) / step_e
        if abs(x - exact_optimal_x) < 1e-6:
            status = "<-- Maximum Stationary Point (dA/e approx 0)"
        elif diff_quotient > 0:
            status = "Increasing Region (dA/e > 0)"
        else:
            status = "Decreasing Region (dA/e < 0)"
        print(f"{x:<10.2f}{a_x:<16.4f}{a_xe:<18.4f}{diff_quotient:<18.4f}{status}")
        
    print("-" * 72)
    print("Conclusion: Decades before Newton & Leibniz, Fermat established the algebraic essence of f'(x) = 0.")
    print("=" * 72)

if __name__ == "__main__":
    calculate_fermat_adequality()
`
  },
  {
    id: "barrow_characteristic_triangle",
    title: "巴罗微分特征三角形与微商切线 (Barrow Characteristic Triangle)",
    historicalMathematician: "伊萨克·巴罗 (Isaac Barrow)",
    year: "1670年",
    description: "几何切线与微积分特征三角形 (dx, dy, ds) 极限计算，通过割线逼近切线证明面积导数即为曲线纵坐标。",
    defaultParams: { x: 2.0 },
    sampleOutputNote: "Calculates difference quotient convergence under diminishing Delta x step sizes towards exact derivative.",
    defaultCode: `#!/usr/bin/env python3
"""
=============================================================================
Calculus Historical Algorithms: Barrow's Characteristic Triangle (1670)
Isaac Barrow's Differential Characteristic Triangle: dy/dx = f'(x)

Mathematical Principles:
1. Given curve y = f(x) = x^3
2. Select fixed tangent point P(x0, y0) and neighboring perturbed point Q(x0 + Delta x, y0 + Delta y)
3. Construct the differential characteristic triangle with sides (Delta x, Delta y, Delta s).
4. Secant slope: k_secant = Delta y / Delta x = [(x0 + Delta x)^3 - x0^3] / Delta x
                        = 3*x0^2 + 3*x0*(Delta x) + (Delta x)^2
5. As Delta x -> 0, secant triangle morphs into tangent triangle: k_tangent = 3*x0^2.
=============================================================================
"""

import sys
import math

def calculate_barrow_tangent(x0=2.0):
    print("=" * 72)
    print("BARROW'S DIFFERENTIAL CHARACTERISTIC TRIANGLE & TANGENT DERIVATIVE (1670)")
    print(f"Curve Equation: y = f(x) = x^3, Tangent Point x0 = {x0:.4f}, y0 = {x0**3:.4f}")
    exact_derivative = 3.0 * (x0 ** 2)
    print(f"Theoretical Exact Derivative: f'(x0) = 3*x0^2 = {exact_derivative:.8f}")
    print("=" * 72)
    
    steps = [1.0, 0.5, 0.2, 0.1, 0.05, 0.01, 0.001, 0.0001, 1e-6]
    
    print(f"{'Step Delta x':<14}{'Increment Delta y':<18}{'Secant Slope dy/dx':<20}{'Exact Tangent f’(x0)':<20}{'Abs Residual'}")
    print("-" * 72)
    
    for dx in steps:
        y0 = x0 ** 3
        y1 = (x0 + dx) ** 3
        dy = y1 - y0
        secant_slope = dy / dx
        err = abs(secant_slope - exact_derivative)
        print(f"{dx:<14.6f}{dy:<18.8f}{secant_slope:<20.8f}{exact_derivative:<20.8f}{err:.6e}")
        
    print("-" * 72)
    print(f"-> As Delta x decreases from 1.0 to 1e-6, secant slope converges monotonically to {exact_derivative:.4f}.")
    print("-> Barrow's characteristic triangle directly inspired Leibniz's symbols dx, dy and the FTC.")
    print("=" * 72)

if __name__ == "__main__":
    x = 2.0
    if len(sys.argv) > 1:
        try:
            x = float(sys.argv[1])
        except ValueError:
            pass
    calculate_barrow_tangent(x0=x)
`
  }
];
