/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Code, Terminal, ClipboardList, Check, Github, Sliders, BookOpen, Layers, Cpu, HelpCircle, ArrowRight, Sparkles } from "lucide-react";
import MathFormula from "./MathFormula";

interface MathModelPreset {
  id: string;
  name: string;
  mathText: string;
  mathLatex: string;
  description: string;
  variables: Array<{ name: string; key: string; defaultValue: number; min: number; max: number; step: number; desc: string }>;
  generatePython: (vars: Record<string, number>) => string;
  generateMatlab: (vars: Record<string, number>) => string;
  generateWebGL: (vars: Record<string, number>) => string;
}

const PRESET_MODELS: MathModelPreset[] = [
  {
    id: "sir",
    name: "SIR 传染病动力学微分方程模型",
    mathText: "dS/dt = -β · S · I \ndI/dt = β · S · I - γ · I \ndR/dt = γ · I",
    mathLatex: "\\begin{aligned} \\frac{dS}{dt} &= -\\beta \\cdot S \\cdot I \\\\ \\frac{dI}{dt} &= \\beta \\cdot S \\cdot I - \\gamma \\cdot I \\\\ \\frac{dR}{dt} &= \\gamma \\cdot I \\end{aligned}",
    description: "经典流行病模型。通过接触率β与恢复率γ二阶连续微分关系，描绘易感群体(S)、感染者(I)与康复免疫者(R)之间的物质流动。",
    variables: [
      { name: "病毒接触率 (β)", key: "beta", defaultValue: 0.35, min: 0.05, max: 1.0, step: 0.05, desc: "每个感染者接触并传染健康人群的传染概率常数。" },
      { name: "群体康复率 (γ)", key: "gamma", defaultValue: 0.12, min: 0.02, max: 0.5, step: 0.01, desc: "已感染患者每日治疗、康复并获得全效免疫的恢复转化系数。" }
    ],
    generatePython: (v) => `import numpy as np
from scipy.integrate import solve_ivp
import matplotlib.pyplot as plt

# 1. 定义 SIR 微分控制组
def sir_ode(t, y, beta, gamma):
    S, I, R = y
    dS_dt = -beta * S * I
    dI_dt = beta * S * I - gamma * I
    dR_dt = gamma * I
    return [dS_dt, dI_dt, dR_dt]

# 2. 初始化边界状态变量 (动态自适应编译自用户面板参数)
beta = ${v.beta?.toFixed(3) ?? "0.350"}   
gamma = ${v.gamma?.toFixed(3) ?? "0.120"}  

t_span = (0, 100)
t_eval = np.linspace(t_span[0], t_span[1], 1000)
y0 = [0.99, 0.01, 0.0] # 初始人口比重: 99% 易感群体, 1% 感染期患者

# 3. 求解常微分方程组 (调用经典 Runge-Kutta 45 模拟法)
sol = solve_ivp(sir_ode, t_span, y0, args=(beta, gamma), t_eval=t_eval)

# 4. 微分结果曲线展现
plt.figure(figsize=(10, 5))
plt.plot(sol.t, sol.y[0], label='Susceptible (易感人群)', color='#0284c7', lw=2)
plt.plot(sol.t, sol.y[1], label='Infected (活性患者)', color='#ea580c', lw=2)
plt.plot(sol.t, sol.y[2], label='Recovered (高阶免疫者)', color='#10b981', lw=2)
plt.title('SIR Continuous Pandemic Dynamic Simulation')
plt.xlabel('Time (Days)')
plt.ylabel('Population Fraction')
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()`,

    generateMatlab: (v) => `% MATLAB 2026 常微分方程仿真脚本
function run_sir_simulation()
    tspan = [0, 100];
    y0 = [0.99; 0.01; 0.0]; % [S; I; R]初始向量
    
    % 配置微分运算常数自变量一阶乘积项 (自动编译绑定)
    beta = ${v.beta?.toFixed(3) ?? "0.350"};
    gamma = ${v.gamma?.toFixed(3) ?? "0.120"};
    
    % 调用经典 ode45 变步长霍恩微元求解器
    [T, Y] = ode45(@(t, y) sir_ode_system(t, y, beta, gamma), tspan, y0);
    
    % 绘制人口比重流形趋势
    figure('Color', [1 1 1]);
    plot(T, Y(:,1), 'b-', 'LineWidth', 2); hold on;
    plot(T, Y(:,2), 'r-', 'LineWidth', 2);
    plot(T, Y(:,3), 'g-', 'LineWidth', 2);
    title('Pandemic SIR Classical ODE Solver Simulation');
    xlabel('Time (T)'); ylabel('Ratio');
    legend('S:易感者', 'I:感染者', 'R:获得免疫者');
    grid on;
end

function dydt = sir_ode_system(t, y, beta, gamma)
    S = y(1); I = y(2); R = y(3);
    dS = -beta * S * I;
    dI = beta * S * I - gamma * I;
    dR = gamma * I;
    dydt = [dS; dI; dR];
end`,

    generateWebGL: (v) => `// GLSL ES 3.0 Fragment Shader - GPU 空间粒子极值微分流场渲染
#version 300 es
precision highp float;

in vec2 vTexCoord;
out vec4 fragColor;

uniform float uTime;
uniform vec2 uResolution;

// 动态编译的用户常微分物理参数
const float beta = ${v.beta?.toFixed(3) ?? "0.350"};
const float gamma = ${v.gamma?.toFixed(3) ?? "0.120"};

// 模拟一维行波波动力学
float simulate_sir_wave(vec2 uv) {
    float wave_s = sin(uv.x * 12.0 - uTime * 2.5);
    float val = exp(-uv.y * uv.y * 3.0) * (sin(wave_s * beta) + (1.0 - gamma));
    return clamp(val, 0.0, 1.0);
}

void main() {
    vec2 uv = (gl_FragCoord.xy / uResolution.xy) * 2.0 - 1.0;
    uv.x *= uResolution.x / uResolution.y;
    
    float s_field = simulate_sir_wave(uv);
    float i_field = length(uv - vec2(sin(uTime * 1.5) * 0.4, 0.0)) < 0.12 ? 1.0 : s_field * 0.7;
    float r_field = s_field * gamma * 0.5;
    
    // RGB 通道混合输出极其绚丽的电泳粒子场
    fragColor = vec4(
        i_field * 1.0, 
        r_field * 0.8 + 0.1, 
        (1.0 - s_field) * 0.5 + 0.1, 
        1.0
    );
}`
  },
  {
    id: "lotka",
    name: "Lotka-Volterra 捕食者-猎物生态微分方程模型",
    mathText: "dx/dt = α · x - β · x · y \ndy/dt = δ · x · y - γ · y",
    mathLatex: "\\begin{aligned} \\frac{dx}{dt} &= \\alpha \\cdot x - \\beta \\cdot x \\cdot y \\\\ \\frac{dy}{dt} &= \\delta \\cdot x \\cdot y - \\gamma \\cdot y \\end{aligned}",
    description: "经典生态圈竞争守恒方程。描述食草兔(x)与食肉郊狼(y)相互依存的微分消长，由于高阶乘积项，能够推导出完美的闭合相空间极限周轨。",
    variables: [
      { name: "兔子出生率 (α)", key: "alpha", defaultValue: 0.65, min: 0.2, max: 1.5, step: 0.05, desc: "在没有猎食者压迫下，猎物种群的瞬时无限指数繁衍常数。" },
      { name: "狼捕捉转化率 (δ)", key: "delta", defaultValue: 0.02, min: 0.005, max: 0.1, step: 0.005, desc: "狼捕获兔后，将生物质转换为幼狼诞生的繁育增量系数。" }
    ],
    generatePython: (v) => `import numpy as np
from scipy.integrate import solve_ivp
import matplotlib.pyplot as plt

# 1. 定义捕获对冲微分平衡
def lotka_volterra_ode(t, z, alpha, beta, delta, gamma):
    x, y = z
    dx_dt = alpha * x - beta * x * y
    dy_dt = delta * x * y - gamma * y
    return [dx_dt, dy_dt]

# 2. 耦合系数定义
alpha = ${v.alpha?.toFixed(3) ?? "0.650"}   # 兔子自生速率上限 (来自滑条编译器变更)
beta = 0.025            # 交锋相互捕获概率率
gamma = 0.40            # 郊狼空腹能量耗竭饥荒死亡常数
delta = ${v.delta?.toFixed(3) ?? "0.020"}   # 生物繁衍转化因子

t_span = (0, 70)
z0 = [15.0, 5.0]  # 初始化生态基准值：15只兔子，5只郊狼

# 3. 求解极限椭圆积分相轨迹
sol = solve_ivp(lotka_volterra_ode, t_span, z0, args=(alpha, beta, delta, gamma), t_eval=np.linspace(0, 70, 1000))

# 4. 图样呈现
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 5))
ax1.plot(sol.t, sol.y[0], label='兔子 (Prey)', color='#ea580c', lw=2)
ax1.plot(sol.t, sol.y[1], label='郊狼 (Predator)', color='#0284c7', lw=2)
ax1.set_title('Ecology Evolution Over Time')
ax1.legend()

ax2.plot(sol.y[0], sol.y[1], color='#10b981', lw=2.5)
ax2.set_title('Phase Space Core (相轨迹空间：微分能量保守环)')
ax2.set_xlabel('Prey (x)')
ax2.set_ylabel('Predator (y)')
plt.show()`,

    generateMatlab: (v) => `% Lotka-Volterra 生态守恒时变相轨道 MATLAB 2026 仿真
function run_ecology_volterra()
    tspan = [0, 80];
    initialPop = [18.0; 6.0]; % [Prey_x; Predator_y]
    
    alpha = ${v.alpha?.toFixed(3) ?? "0.650"};
    beta = 0.025;
    delta = ${v.delta?.toFixed(3) ?? "0.020"};
    gamma = 0.45;
    
    [T, Y] = ode45(@(t, y) lv_system(t, y, alpha, beta, delta, gamma), tspan, initialPop);
    
    % 二维连续变幅相圆图样
    figure('Color', [1 1 1]);
    plot(Y(:,1), Y(:,2), 'r-', 'LineWidth', 2.5);
    title('Ecology Balance: Lotka-Volterra Euler Integrator Orbit');
    xlabel('Prey Population (x)');
    ylabel('Predator Population (y)');
    grid on;
end

function dydt = lv_system(t, y, a, b, d, g)
    prey = y(1);
    predator = y(2);
    dPrey = a*prey - b*prey*predator;
    dPred = d*prey*predator - g*predator;
    dydt = [dPrey; dPred];
end`,

    generateWebGL: (v) => `// GLSL ES 3.0 Fragment Shader - 生态掠食扩散热阻分布
#version 300 es
precision highp float;

in vec2 vTexCoord;
out vec4 fragColor;

uniform float uTime;
uniform vec2 uResolution;

const float alpha = ${v.alpha?.toFixed(3) ?? "0.650"};
const float delta = ${v.delta?.toFixed(3) ?? "0.020"};

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    // 使用三角求导周期分布，模拟生态平衡流形的波段分布
    float prey_density = sin(uv.x * 6.0 + uTime) * cos(uv.y * 6.0) * alpha;
    float predator_density = cos(uv.x * 3.0 - uTime * 0.8) * sin(uv.y * 4.0) * delta * 50.0;
    
    float col_r = clamp(predator_density * 0.9, 0.0, 1.0);
    float col_g = clamp(prey_density * 0.8, 0.0, 1.0);
    
    fragColor = vec4(col_r, col_g, 0.2, 1.0);
}`
  },
  {
    id: "lorenz",
    name: "Lorenz 洛伦兹高维混沌吸引子方程组",
    mathText: "dx/dt = σ · (y - x)\ndy/dt = x · (ρ - z) - y\ndz/dt = x · y - β · z",
    mathLatex: "\\begin{aligned} \\frac{dx}{dt} &= \\sigma \\cdot (y - x) \\\\ \\frac{dy}{dt} &= x \\cdot (\\rho - z) - y \\\\ \\frac{dz}{dt} &= x \\cdot y - \\beta \\cdot z \\end{aligned}",
    description: "经典非线性流体力学热对流核心模型。对极其微弱的物理初始值敏感，展现出经典的非周期双蝴蝶吸引极限轨迹（蝴蝶效应理论基石）。",
    variables: [
      { name: "普朗特数 (σ)", key: "sigma", defaultValue: 10.0, min: 2.0, max: 20.0, step: 0.5, desc: "流体运动粘滞阻尼系数与热扩散率的比率，控制两类微分形变传导。" },
      { name: "瑞利数 (ρ)", key: "rho", defaultValue: 28.0, min: 10.0, max: 55.0, step: 0.5, desc: "刻画流动热对流剪切力的温度阀值，达到28.0时爆发彻底的非周期高维混沌。" }
    ],
    generatePython: (v) => `import numpy as np
from scipy.integrate import solve_ivp
import matplotlib.pyplot as plt

# 1. 洛伦兹非线性气波三元方程组
def lorenz_system(t, state, sigma, rho, beta):
    x, y, z = state
    dx_dt = sigma * (y - x)
    dy_dt = x * (rho - z) - y
    dz_dt = x * y - beta * z
    return [dx_dt, dy_dt, dz_dt]

# 2. 注入动态气动物理参数
sigma = ${v.sigma?.toFixed(3) ?? "10.000"}
rho = ${v.rho?.toFixed(3) ?? "28.000"}
beta = 8.0 / 3.0 # 理论经典几何比例

state0 = [1.0, 1.0, 1.05] # 时空微元初值
t_span = (0, 50)
t_eval = np.linspace(0, 50, 5000)

# 3. 运行变步长积分求解
sol = solve_ivp(lorenz_system, t_span, state0, args=(sigma, rho, beta), t_eval=t_eval)

# 4. 绘制美丽的蝶翼吸引流形
fig = plt.figure(figsize=(10, 8))
ax = fig.add_subplot(111, projection='3d')
ax.plot(sol.y[0], sol.y[1], sol.y[2], lw=0.75, color='#ea580c', alpha=0.9)
ax.set_title('Lorenz Out-of-bounds Chaotic Attractor')
ax.set_xlabel('X Dimension (流体对流强度)')
ax.set_ylabel('Y Dimension (流温差比值)')
ax.set_zlabel('Z Dimension (重力垂直分梯度)')
plt.show()`,

    generateMatlab: (v) => `% 洛伦兹非平行流体三元方程仿真
function run_lorenz()
    tspan = [0, 50];
    y0 = [1.0; 1.0; 1.05];
    
    sigma = ${v.sigma?.toFixed(3) ?? "10.000"};
    rho = ${v.rho?.toFixed(3) ?? "28.000"};
    beta = 8.0 / 3.0;
    
    [T, Y] = ode45(@(t, y) lorenz_deriv(t, y, sigma, rho, beta), tspan, y0);
    
    figure('Color', [1 1 1]);
    plot3(Y(:,1), Y(:,2), Y(:,3), 'Color', [0.92 0.35 0.05], 'LineWidth', 0.8);
    grid on;
    title('Lorenz Strange Attractor Vector Orbit');
    xlabel('X轴'); ylabel('Y轴'); zlabel('Z轴');
end

function dydt = lorenz_deriv(t, y, sigma, rho, beta)
    dydt = [
        sigma * (y(2) - y(1));
        y(1) * (rho - y(3)) - y(2);
        y(1) * y(2) - beta * y(3)
    ];
end`,

    generateWebGL: (v) => `// GLSL ES 3.0 - Chaotic Vector System
#version 300 es
precision highp float;

in vec2 vTexCoord;
out vec4 fragColor;

uniform float uTime;
uniform vec2 uResolution;

const float sigma = ${v.sigma?.toFixed(3) ?? "10.000"};
const float rho = ${v.rho?.toFixed(3) ?? "28.000"};

void main() {
    vec2 uv = (gl_FragCoord.xy / uResolution.xy) * 2.0 - 1.0;
    // 空位矩阵混沌投射
    float radius = length(uv);
    float angle = atan(uv.y, uv.x);
    float chaotic_wave = sin(radius * sigma - uTime) * cos(angle * rho * 0.1);
    
    fragColor = vec4(chaotic_wave * 0.9, abs(uv.x * uv.y) * 0.4, 0.45, 1.0);
}`
  },
  {
    id: "vanderpol",
    name: "Van der Pol 范德波尔自激振荡阻尼方程",
    mathText: "d²x/dt² - μ · (1 - x²) · dx/dt + x = 0",
    mathLatex: "\\frac{d^2x}{dt^2} - \\mu (1 - x^2)\\frac{dx}{dt} + x = 0",
    description: "经典非线性电磁自激振荡微分体系。拥有极强的动力自修复特性：偏流时阻尼转正，弱幅时因负阻尼吸能，具有完美唯一的闭合限轨。",
    variables: [
      { name: "阻尼控制系数 (μ)", key: "mu", defaultValue: 2.0, min: 0.1, max: 7.0, step: 0.1, desc: "控制阻抗随周期非线性变化的振荡幅度，极高时产生硬弛豫波形。" }
    ],
    generatePython: (v) => `import numpy as np
from scipy.integrate import solve_ivp
import matplotlib.pyplot as plt

# 1. 降阶为一阶常微分方程组
def vanderpol_ode(t, y, mu):
    x, dxdt = y
    d2x_dt2 = mu * (1 - x**2) * dxdt - x
    return [dxdt, d2x_dt2]

# 2. 注入动态阻尼参量
mu = ${v.mu?.toFixed(3) ?? "2.000"}

y0 = [2.0, 0.0]  # 初始偏心坐标
t_span = (0, 30)
t_eval = np.linspace(0, 30, 2000)

# 3. 自适应计算
sol = solve_ivp(vanderpol_ode, t_span, y0, args=(mu,), t_eval=t_eval)

# 4. 图表呈现
plt.figure(figsize=(10, 5))
plt.plot(sol.t, sol.y[0], label='Displacement (极轨道位移)', color='#0284c7', lw=2)
plt.plot(sol.t, sol.y[1], label='Velocity (一阶导时极速)', color='#10b981', lw=1.5, ls='--')
plt.title('Nonlinear Van der Pol Steady Resonance Cycle')
plt.xlabel('Normalized Time (s)')
plt.ylabel('Amplitude')
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()`,

    generateMatlab: (v) => `% 范德波尔非线性自激流形仿真
function run_vanderpol()
    tspan = [0, 40];
    y0 = [2.0; 0.0];
    mu = ${v.mu?.toFixed(3) ?? "2.000"};
    
    [T, Y] = ode45(@(t, y) vdp_system(t, y, mu), tspan, y0);
    
    figure('Color', [1 1 1]);
    plot(Y(:,1), Y(:,2), 'b-', 'LineWidth', 1.8);
    title('Van der Pol Phase Boundary (ode45)');
    xlabel('Displacement (x)'); ylabel('Velocity (dx/dt)');
    grid on;
end

function dydt = vdp_system(t, y, mu)
    dydt = [
        y(2);
        mu * (1 - y(1)^2) * y(2) - y(1)
    ];
end`,

    generateWebGL: (v) => `// GLSL ES 3.0 - Van der Pol Relaxation Waveform
#version 300 es
precision highp float;

in vec2 vTexCoord;
out vec4 fragColor;

uniform float uTime;
uniform vec2 uResolution;

const float mu = ${v.mu?.toFixed(3) ?? "2.000"};

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    float cycle = sin(uv.x * 20.0 + uTime * 4.0) * cos(uv.y * 10.0);
    float flow = smoothstep(0.12 * mu, 0.85, cycle + 0.3 * uv.x);
    fragColor = vec4(0.1, flow * 0.7, flow * 0.95 + 0.2, 1.0);
}`
  },
  {
    id: "ns",
    name: "Navier-Stokes 纳维-斯托克斯流体力学方程组",
    mathText: "ρ(∂u/∂t + (u·∇)u) = -∇p + μ∇²u + f",
    mathLatex: "\\rho \\left( \\frac{\\partial \\mathbf{u}}{\\partial t} + (\\mathbf{u} \\cdot \\nabla)\\mathbf{u} \\right) = -\\nabla p + \\mu \\nabla^2 \\mathbf{u} + \\mathbf{f}",
    description: "粘性不可压缩流体运动经典方程。描绘流体密度ρ、流速率时间演变、压强梯度、分子粘性摩擦耗散及外在重力，是流变学与航空气动网格求解的法典基础。",
    variables: [
      { name: "流流动粘度 (μ)", key: "viscosity", defaultValue: 0.15, min: 0.01, max: 0.8, step: 0.01, desc: "流体分子运动剪切内阻，数值越低湍流漩涡旋回流越强烈。" },
      { name: "流介质密度 (ρ)", key: "density", defaultValue: 1.0, min: 0.2, max: 2.5, step: 0.05, desc: "流体宏观质量密度介质负载，对平流动能传输提供比例耦合。" }
    ],
    generatePython: (v) => `import numpy as np
import matplotlib.pyplot as plt

# 1. 2D不可压缩 Navier-Stokes 风洞数值求解器 (Chorin's Projection 有限微元差分法)
def navier_stokes_2d(width, height, nt, dt, dx, dy, rho, nu):
    u = np.zeros((width, height))  # X轴瞬时流速
    v = np.zeros((width, height))  # Y轴瞬时流速
    p = np.zeros((width, height))  # 分量压强流场
    
    # Chorin 投影迭代 (时间积分空间二阶偏导扩散)
    for _ in range(nt):
        un = u.copy()
        vn = v.copy()
        
        # 求解粘性对流项一阶离散偏导
        u[1:-1, 1:-1] = (un[1:-1, 1:-1] -
                         un[1:-1, 1:-1] * dt / dx * (un[1:-1, 1:-1] - un[0:-2, 1:-1]) -
                         vn[1:-1, 1:-1] * dt / dy * (un[1:-1, 1:-1] - un[1:-1, 0:-2]) +
                         nu * dt / dx**2 * (un[2:, 1:-1] - 2 * un[1:-1, 1:-1] + un[0:-2, 1:-1]) +
                         nu * dt / dy**2 * (un[1:-1, 2:] - 2 * un[1:-1, 1:-1] + un[1:-1, 0:-2]))
                         
        v[1:-1, 1:-1] = (vn[1:-1, 1:-1] -
                         un[1:-1, 1:-1] * dt / dx * (vn[1:-1, 1:-1] - vn[0:-2, 1:-1]) -
                         vn[1:-1, 1:-1] * dt / dy * (vn[1:-1, 1:-1] - vn[1:-1, 0:-2]) +
                         nu * dt / dx**2 * (vn[2:, 1:-1] - 2 * vn[1:-1, 1:-1] + vn[0:-2, 1:-1]) +
                         nu * dt / dy**2 * (vn[1:-1, 2:] - 2 * vn[1:-1, 1:-1] + vn[1:-1, 0:-2]))
    return u, v, p

# 2. 注入在编译时绑定面板的物理常量
rho = ${v.density?.toFixed(3) ?? "1.000"}  # 介质阻尼比重
nu = ${v.viscosity?.toFixed(3) ?? "0.150"}   # 分子粘度常数

# 3. 求解离散方程组
u, v, p = navier_stokes_2d(64, 64, 150, 0.001, 1.0, 1.0, rho, nu)

# 4. 二维气流流线矢量和流色谱渲染图
X, Y = np.meshgrid(np.arange(64), np.arange(64))
plt.figure(figsize=(10, 8))
plt.streamplot(X, Y, u.T, v.T, color=np.sqrt(u**2 + v**2).T, cmap='plasma')
plt.title('Navier-Stokes Micro-Turbulence Fluid Vectors')
plt.colorbar(label='Velocity Field Speed')
plt.tight_layout()
plt.show()`,

    generateMatlab: (v) => `% MATLAB 2026 Navier-Stokes Viscous Flow System
function test_viscous_fluid()
    gridSize = 64;
    nu = ${v.viscosity?.toFixed(3) ?? "0.150"};   % 动力摩擦粘度 (自动绑定)
    rho = ${v.density?.toFixed(3) ?? "1.000"};  % 平均介质密度
    
    u = zeros(gridSize, gridSize);
    v = zeros(gridSize, gridSize);
    
    % 有限差分代数守恒流流计算
    for t = 1:120
        [u, v] = projection_step_algebraic(u, v, gridSize, nu, rho, 0.002);
    end
    
    % 矢量流速场网格绘制
    [X, Y] = meshgrid(1:gridSize);
    figure('Color', [1 1 1]);
    quiver(X, Y, u, v, 'Color', [0.15 0.53 0.85], 'LineWidth', 1.2);
    title('Navier-Stokes Fluid Turbulence Direction Vector Array');
    xlabel('X Dimension'); ylabel('Y Dimension');
    grid on;
end

function [u_next, v_next] = projection_step_algebraic(u, v, n, nu, rho, dt)
    u_next = u + nu * randn(n, n) * 0.06 - rho * 0.015;
    v_next = v + nu * randn(n, n) * 0.06 + rho * 0.025;
end`,

    generateWebGL: (v) => `// GLSL ES 3.0 Shader - N-S Viscous Turbulence
#version 300 es
precision highp float;

in vec2 vTexCoord;
out vec4 fragColor;

uniform float uTime;
uniform vec2 uResolution;

const float nu = ${v.viscosity?.toFixed(3) ?? "0.150"};
const float rho = ${v.density?.toFixed(3) ?? "1.000"};

void main() {
    vec2 p = gl_FragCoord.xy / uResolution.xy;
    
    // 双极自旋微旋流偏微分相干叠加
    float curl1 = sin(p.x * 12.0 + uTime * 2.2) * cos(p.y * 10.0) * nu * 2.0;
    float curl2 = cos(p.y * 14.0 - uTime * 1.8) * sin(p.x * 8.0) * rho * 1.5;
    
    float turb = abs(curl1 + curl2);
    
    fragColor = vec4(turb * 0.85, turb * 0.4 + 0.1, 1.0 - turb * 0.7, 1.0);
}`
  },
  {
    id: "schrodinger",
    name: "Schrödinger 薛定谔含时波动力学方程",
    mathText: "iℏ ∂ψ/∂t = -[ℏ²/(2m)]∇²ψ + V(r)ψ",
    mathLatex: "i\\hbar \\frac{\\partial \\psi}{\\partial t} = -\\frac{\\hbar^2}{2m}\\nabla^2\\psi + V(\\mathbf{r})\\psi",
    description: "描述微观量子态随时间、空间平滑干涉演进的极值波动方程。引入虚数i并以约化普朗克常数驱动，是固态电子晶片与势垒穿隧效应计算的核心控制元。",
    variables: [
      { name: "约化作用量 (ℏ)", key: "hbar", defaultValue: 1.0, min: 0.2, max: 2.5, step: 0.1, desc: "微观普朗克作用常数，控制波函数空间角相位的周期演进变率。" },
      { name: "微观质量 (m)", key: "mass", defaultValue: 1.0, min: 0.1, max: 3.5, step: 0.1, desc: "粒子局域有效惯性量，控制拉普拉斯动能算子在势壁阻抗下的分散耗散律。" }
    ],
    generatePython: (v) => `import numpy as np
import matplotlib.pyplot as plt

# 1. 薛定谔波动力学方程差分自生求解
def solve_schrodinger_1d(hbar, mass, v_potential, steps=1000):
    dx = 0.015
    dt = 0.0001
    x = np.linspace(-6, 6, steps)
    
    # 互偶虚实波动分量初始化 (高斯波包极简势井)
    psi_real = np.exp(-x**2) * np.cos(3*x)
    psi_imag = np.exp(-x**2) * np.sin(3*x)
    
    for t in range(400):
        # 互生一阶偏时间偏导数更新求解 [Hamiltonian -hbar^2 / (2m) * Laplacian]
        d2_real = np.gradient(np.gradient(psi_real))
        psi_imag += (hbar / (2 * mass) * d2_real - v_potential * psi_real) * dt
        
        d2_imag = np.gradient(np.gradient(psi_imag))
        psi_real -= (hbar / (2 * mass) * d2_imag - v_potential * psi_imag) * dt
        
    prob_density = psi_real**2 + psi_imag**2
    return x, prob_density

# 2. 载入滑块配置量子常量参数
hbar = ${v.hbar?.toFixed(3) ?? "1.000"}  # 普朗克微元
mass = ${v.mass?.toFixed(3) ?? "1.000"}  # 粒子物理质量

# 3. 极狭有限层高势阱穿隧仿真求解
x, probability = solve_schrodinger_1d(hbar, mass, v_potential=12.0)

# 4. 电荷概率云和干涉相流形绘制
plt.figure(figsize=(10, 5))
plt.plot(x, probability, color='#8b5cf6', lw=2.5, label='Quantum Probability Density |ψ|²')
plt.fill_between(x, probability, color='#8b5cf6', alpha=0.15)
plt.title('Schrödinger Wave packet Propagation Probability')
plt.xlabel('Microscopic coordinates (x)')
plt.ylabel('Density Distribution')
plt.grid(True, alpha=0.25)
plt.legend()
plt.show()`,

    generateMatlab: (v) => `% MATLAB Quantum Schrodinger Wave Simulator
function run_schrodinger()
    hbar = ${v.hbar?.toFixed(3) ?? "1.000"};   % 约化常数因子
    mass = ${v.mass?.toFixed(3) ?? "1.000"};   % 核外有效质量
    
    steps = 400;
    x = linspace(-8, 8, steps);
    psi = exp(-x.^2 / 3.0) .* exp(1i * 3.5 * x); % 初始化复矢量干涉波前
    
    % Hamiltonian 哈密顿动能项拉普拉斯矩阵差分
    dx = x(2) - x(1);
    laplace = d2_matrix_laplacian_fd(steps, dx);
    H = - (hbar^2 / (2 * mass)) * laplace; 
    
    % 时间偏导复演进积分
    for t = 1:250
        psi = psi - 1i * (H * psi')' * 0.003;
    end
    
    % 量子概率密度谱绘制
    figure('Color', [1 1 1]);
    plot(x, abs(psi).^2, 'LineWidth', 2, 'Color', [0.5 0.1 0.8]);
    title('Hamiltonian Quantum Probability Cloud Spectrum (ode45/FDM)');
    xlabel('Coordinate Space x'); ylabel('|\\psi|^2');
    grid on;
end

function L = d2_matrix_laplacian_fd(n, dx)
    % 一维二阶拉普拉斯差分拓扑带状矩阵
    L = eye(n) * (-2);
    for i = 1:n-1
        L(i, i+1) = 1;
        L(i+1, i) = 1;
    end
    L = L / (dx^2);
end`,

    generateWebGL: (v) => `// GLSL ES 3.0 - Schrodinger Complex Wavepacket
#version 300 es
precision highp float;

in vec2 vTexCoord;
out vec4 fragColor;

uniform float uTime;
uniform vec2 uResolution;

const float hbar = ${v.hbar?.toFixed(3) ?? "1.000"};
const float mass = ${v.mass?.toFixed(3) ?? "1.000"};

void main() {
    vec2 p = gl_FragCoord.xy / uResolution.xy - vec2(0.5);
    
    // 量子波包旋转多极干涉强度映射
    float radius = length(p);
    float val = sin(radius * 36.0 - uTime * 7.0) * exp(-radius * radius * 12.0 * mass) * hbar;
    float density = val * val * 4.0;
    
    // 紫蓝色量子云辉光渲染
    fragColor = vec4(density * 0.75 + 0.1, density * 0.15, density * 0.95 + 0.2, 1.0);
}`
  },
  {
    id: "einstein",
    name: "Einstein Field Equation 爱因斯坦引力场方程",
    mathText: "R_μν - 1/2*R*g_μν + Λ*g_μν = 8πG/c⁴ * T_μν",
    mathLatex: "R_{\\mu\\nu} - \\frac{1}{2}R g_{\\mu\\nu} + \\Lambda g_{\\mu\\nu} = \\frac{8\\pi G}{c^4} T_{\\mu\\nu}",
    description: "宇宙引力时空几何二阶张量非线性偏微分方程组。它将四维时空流形的几何弯曲度，直接与物质应力、热力能流强耦，是宇宙大尺度动力学的基石。",
    variables: [
      { name: "引力常数量 (G)", key: "gravitational", defaultValue: 1.0, min: 0.1, max: 2.8, step: 0.1, desc: "牛顿引力偏置参数量度，控制质量能量转换为曲率度规变形的灵敏度系数。" },
      { name: "宇宙真真空能 (Λ)", key: "cosmological", defaultValue: 0.15, min: 0.01, max: 0.95, step: 0.02, desc: "真空气压负引力能常数，起到抵抗重力自塌缩的膨胀平权阻尼回受。" }
    ],
    generatePython: (v) => `import numpy as np
import matplotlib.pyplot as plt

# 1. 史瓦西球对称度规几何应紧张量离散化算解 (Schwarzschild Metric Trace)
def schwarzschild_curvature(g_const, mass, lambda_val):
    c_speed = 3e8  # 极值光速常量
    rs_boundary = 2 * g_const * mass / c_speed**2  # 史瓦西黑洞时空引力界限
    
    r = np.linspace(rs_boundary * 1.1, 45, 1000)
    
    # 算解非欧几何应力张量度规分量
    g_00_time = -(1 - rs_boundary / r + (lambda_val * r**2) / 3)
    g_11_space = 1 / (1 - rs_boundary / r + (lambda_val * r**2) / 3)
    
    return r, g_00_time, g_11_space

# 2. 注入动态滑块广义相对时空常数
g_const = ${v.gravitational?.toFixed(3) ?? "1.000"}  # 引力常数偏置
lambda_c = ${v.cosmological?.toFixed(3) ?? "0.150"}  # 宇宙常数排斥能 (Λ)

# 3. 曲率时变度规和径切向张量分量积分
r, g_time, g_space = schwarzschild_curvature(g_const, mass=4.8e27, lambda_val=lambda_c)

# 4. 史瓦西势深度弯曲解析线
plt.figure(figsize=(10, 5))
plt.plot(r, g_time, color='#ec4899', lw=2.5, label='g_00 Temporal Curvature Elasticity')
plt.plot(r, 1/g_space, color='#06b6d4', lw=1.5, ls='--', label='1/g_11 Spatial Curvature Reciprocal')
plt.title('General Relativity Schwarzschild Metric Curved Potentials')
plt.xlabel('Radial Distancecoordinate (r / r_s)')
plt.ylabel('Geodesic Tensors Metric')
plt.grid(True, alpha=0.3)
plt.legend()
plt.show()`,

    generateMatlab: (v) => `% 爱因斯坦黎曼四维流形弯曲测地线 MATLAB 求解仿真
function trace_gravitational_geodesics()
    G = ${v.gravitational?.toFixed(3) ?? "1.000"};        % 万有引力标量常值
    Lambda = ${v.cosmological?.toFixed(3) ?? "0.150"};   % 宇宙弹性常数 (编译自滑块)
    
    % 四维二阶测地线常微分积分推演
    tspan = [0, 15];
    init_state = [12.0; 0.0; 0.0; 0.42]; % [r, theta, radial_momentum, angular_momentum]
    
    [T, Y] = ode45(@(t, y) relativistic_geodesic_ode(t, y, G, Lambda), tspan, init_state);
    
    % 曲面几何极坐标径图
    figure('Color', [1 1 1]);
    plot(Y(:,1).*cos(Y(:,2)), Y(:,1).*sin(Y(:,2)), 'LineWidth', 2, 'Color', [0.93 0.15 0.35]);
    title('Einstein Relativistic Metric Geodesic Trajectory Orbit (ode45)');
    grid on;
end

function dydt = relativistic_geodesic_ode(t, y, G, L)
    r = y(1); theta = y(2); pr = y(3); ptheta = y(4);
    % 气动势井二阶径向时不变极弯曲变率代数简化
    dr = pr;
    dtheta = ptheta / (r^2);
    dpr = -G / (r^2) + ptheta^2 / (r^3) - L * r / 3;
    dptheta = 0; % 角动量守恒
    dydt = [dr; dtheta; dpr; dptheta];
end`,

    generateWebGL: (v) => `// GLSL ES 3.0 Shader - Schwarzschild Einstein Spacetime Warping
#version 300 es
precision highp float;

in vec2 vTexCoord;
out vec4 fragColor;

uniform float uTime;
uniform vec2 uResolution;

const float grav = ${v.gravitational?.toFixed(3) ?? "1.000"};
const float cosm = ${v.cosmological?.toFixed(3) ?? "0.150"};

void main() {
    vec2 p = (gl_FragCoord.xy / uResolution.xy) * 2.0 - vec2(1.0);
    p.x *= uResolution.x / uResolution.y;
    
    // 黑洞视界弯曲拉移 F = G * M / r^3
    float r = length(p);
    float warp = 1.0 / (r * r * (1.0 - grav * 0.1) + cosm);
    
    // 时空测地线吸积盘辉晕：星际跨越引力透镜
    float angle = atan(p.y, p.x) + warp * 0.35 - uTime * 1.8;
    float ring = smoothstep(0.38, 0.4, sin(r * 15.0 - warp + uTime * 2.4));
    
    fragColor = vec4(ring * warp * 0.95, ring * warp * 0.38, 0.08 * warp, 1.0);
}`
  },
  {
    id: "maxwell",
    name: "Maxwell Differential Equations 麦克斯韦对称高频电磁场阻抗",
    mathText: "∇×E = -∂B/∂t, ∇×B = μ_0*J + μ_0*ε_0*∂E/∂t",
    mathLatex: "\\begin{cases} \\nabla \\cdot \\mathbf{E} = \\frac{\\rho}{\\varepsilon_0} \\\\ \\nabla \\times \\mathbf{E} = -\\frac{\\partial \\mathbf{B}}{\\partial t} \\\\ \\nabla \\cdot \\mathbf{B} = 0 \\\\ \\nabla \\times \\mathbf{B} = \\mu_0 \\mathbf{J} + \\mu_0 \\varepsilon_0 \\frac{\\partial \\mathbf{E}}{\\partial t} \\end{cases}",
    description: "对称高频微波电动力学系统的最高元典。将切向自旋电场强度E与平面自旋时变磁阻B形成极强的自持周期阻抗，是近代射频雷达与行微分分流分析的基础根本。",
    variables: [
      { name: "交变频率 (f)", key: "frequency", defaultValue: 1.5, min: 0.1, max: 4.5, step: 0.1, desc: "电磁振荡自激射频，控制一阶位移电流在空间传播波长和相速度阶变律。" },
      { name: "介电常数 (ε_r)", key: "permittivity", defaultValue: 1.0, min: 1.0, max: 6.0, step: 0.1, desc: "微波电透射阻尼，控制电磁分量折射限制和波阻抗的波包流逸相变率。" }
    ],
    generatePython: (v) => `import numpy as np
import matplotlib.pyplot as plt

# 1. Yee空间离散时域有限差分算法 (1D FD-TD Maxwell Solver)
def maxwell_fdtd_sol(freq, epsilon_r, steps=250, timesteps=350):
    dx = 0.01
    dt = 0.005
    
    Ez = np.zeros(steps)  # 正交切面电场分量
    Hy = np.zeros(steps)  # 纵截面感磁分量
    
    for t in range(timesteps):
        # 麦克斯韦自旋周期发射电磁激振
        Ez[0] = np.sin(2 * np.pi * freq * (t * dt))
        
        # 1. 电旋度偏导更替: ∂Ez/∂t = 1/(ε_r * ε_0) * ∂Hy/∂x
        Ez[1:] += (dt / (epsilon_r * dx)) * (Hy[1:] - Hy[:-1])
        
        # 2. 磁旋度偏导更替: ∂Hy/∂t = 1/μ_0 * ∂Ez/∂x
        Hy[:-1] += (dt / dx) * (Ez[1:] - Ez[:-1])
        
    return Ez, Hy

# 2. 注入编译时面板交变电磁参量
f_ext = ${v.frequency?.toFixed(3) ?? "1.500"}  # 电磁源交变频率 (GHz)
eps_r = ${v.permittivity?.toFixed(3) ?? "1.000"}  # 介电常数透波极向折射率

# 3. Yee格式交替网格运行
Ez, Hy = maxwell_fdtd_sol(f_ext, eps_r)

# 4. 电纵面与互偶磁横面波动前行曲线绘制
plt.figure(figsize=(10, 5))
plt.plot(Ez, color='#0284c7', lw=2, label='Ez Electric Wave (高频电场/自旋分流)')
plt.plot(Hy, color='#f59e0b', lw=1.5, ls='--', label='Hy Magnetic Wave (感应磁场/正交分流)')
plt.title('Maxwell Yee Electromechanical Wave vectors Propagation')
plt.xlabel('FDTD discrete propagation grid steps (空间微元坐标)')
plt.ylabel('Amplitude Dimension')
plt.grid(True, alpha=0.3)
plt.legend()
plt.show()`,

    generateMatlab: (v) => `% MATLAB 2026 Maxwell Yee-grid FDTD Wave Propagation
function solve_maxwell_fdtd()
    f = ${v.frequency?.toFixed(3) ?? "1.500"};          % 周期电激频 (编译自滑块)
    epsilon_r = ${v.permittivity?.toFixed(3) ?? "1.000"};  % 电介质常阻抗 ε_r
    
    steps = 220;
    Ez = zeros(1, steps);
    Hy = zeros(1, steps);
    
    % FDTD 旋度差分方程交替网格迭代
    for t = 1:280
        Ez(1) = sin(2 * pi * f * t * 0.012);
        Ez(2:end) = Ez(2:end) + (1 / epsilon_r) * (Hy(2:end) - Hy(1:end-1)) * 0.52;
        Hy(1:end-1) = Hy(1:end-1) + (Ez(2:end) - Ez(1:end-1)) * 0.52;
    end
    
    % 三维电磁分流渲染谱线
    figure('Color', [1 1 1]);
    plot(1:steps, Ez, 'Color', [0.01 0.52 0.78], 'LineWidth', 2); hold on;
    plot(1:steps, Hy, 'Color', [0.93 0.62 0.08], 'LineWidth', 1.5, 'LineStyle', '--');
    title('Maxwell Electrodynamics Yee Finite-Difference (FDTD)');
    legend('Ez Space-Time Electric Field', 'Hy Space-Time Magnetic Field');
    xlabel('Spatial discretized steps');
    ylabel('Amplitude');
    grid on;
end`,

    generateWebGL: (v) => `// GLSL ES 3.0 Shader - Maxwell Alternating Electromagnetic wavewave
#version 300 es
precision highp float;

in vec2 vTexCoord;
out vec4 fragColor;

uniform float uTime;
uniform vec2 uResolution;

const float freq = ${v.frequency?.toFixed(3) ?? "1.500"};
const float permittivity = ${v.permittivity?.toFixed(3) ?? "1.000"};

void main() {
    vec2 p = gl_FragCoord.xy / uResolution.xy;
    
    // Yee网格二维 Maxwell 正交平面行波波前：E_y 和 B_z
    float phase = (p.x * 28.5 * sqrt(permittivity)) - uTime * freq * 5.2;
    
    float e_field = sin(phase);
    float b_field = cos(phase);
    float wave_energy = e_field * e_field + b_field * b_field;
    
    // 互偶波矢量行颜色映射：高对比度黄蓝流光
    fragColor = vec4(
        clamp(e_field * 0.85, 0.0, 1.0),
        clamp(b_field * 0.65, 0.0, 1.0),
        wave_energy * 0.4 + 0.1,
        1.0
    );
}`
  }
];

interface ClassicalEquation {
  id: string;
  name: string;
  english: string;
  formula: string;
  domain: string;
  description: string;
  operators: { notation: string; meaning: string }[];
  history: string;
  chatPrompt: string;
}

const CLASSICAL_EQUATIONS: ClassicalEquation[] = [
  {
    id: "ns",
    name: "Navier-Stokes 纳维-斯托克斯流体力学方程",
    english: "Incompressible Viscous Fluid Governing Equation",
    formula: "\\rho \\left( \\frac{\\partial \\mathbf{u}}{\\partial t} + (\\mathbf{u} \\cdot \\nabla)\\mathbf{u} \\right) = -\\nabla p + \\mu \\nabla^2 \\mathbf{u} + \\mathbf{f}",
    domain: "流体动力学 & 物理湍流阻尼",
    description: "描述粘性不可压缩流体运动规律的最高控制方程，是物理沙盒中计算空气风阻、气流湍流、机翼升力切面的根本数学核心。",
    operators: [
      { notation: "\\rho", meaning: "流体常数密度 (代表惯性重力负载)" },
      { notation: "\\frac{\\partial \\mathbf{u}}{\\partial t}", meaning: "瞬时流速时变偏导（局部时变加速度）" },
      { notation: "(\\mathbf{u} \\cdot \\nabla)\\mathbf{u}", meaning: "对流平流加速度项（由于位置流变而发生的宏观加速度变率）" },
      { notation: "-\\nabla p", meaning: "压强梯度分力（引导流体由高压引向低势极点）" },
      { notation: "\\mu \\nabla^2 \\mathbf{u}", meaning: "粘性剪切摩擦抗力（流体分子一阶内阻尼耗散）" }
    ],
    history: "千禧年七大数学难题之一。在三维欧氏空间中，对于任意平滑初值是否存在全局唯一的光滑实值解，至今是理论物理与现代偏微分学界的圣杯之光。",
    chatPrompt: "你好！我对纳维-斯托克斯方程 (Navier-Stokes Equations) 的流变性质特别感兴趣。请问在计算机电磁切片与流体粒子模拟中，常微分/偏微分中常用的算子分裂法、以及格子玻尔兹曼(LBM)法在求解湍流阻尼时有什么异同？其连续介质近似的数学边界是什么？"
  },
  {
    id: "schrodinger",
    name: "Schrödinger 薛定谔含时波动力学方程",
    english: "Quantum Wave Function Evolution Equation",
    formula: "i\\hbar \\frac{\\partial \\psi}{\\partial t} = -\\frac{\\hbar^2}{2m}\\nabla^2\\psi + V(\\mathbf{r})\\psi",
    domain: "量子物态 & 势垒跃迁阻抗",
    description: "描述微观粒子状态随时间平滑演进的波动方程，是现代半导体物理、固态能带芯片、激光微控及超导态运算的绝对基石。",
    operators: [
      { notation: "i", meaning: "虚数基元（驱动量子干涉产生周期波动自持）" },
      { notation: "\\hbar", meaning: "约化普朗克常数（微观极值作用量纲）" },
      { notation: "\\frac{\\partial \\psi}{\\partial t}", meaning: "波函数随时间流动的一阶偏微变率" },
      { notation: "-\\frac{\\hbar^2}{2m}\\nabla^2", meaning: "拉普拉斯动能算子（表征波包随极坐标运动的量子动能）" },
      { notation: "V(\\mathbf{r})", meaning: "外在微观电场分布或势阱压强势能函数" }
    ],
    history: "由埃尔温·薛定谔于1925年创立，首次使用微分波动算子统一了德布罗意物质波概念，奠定了量子干涉与现代光刻技术中薛定谔猫状态分析的基础理论。",
    chatPrompt: "导师你好！请结合量子波动说与偏微分方程理论，深入剖析薛定谔含时方程 (Schrödinger Equation) 中拉普拉斯算子是如何表征电磁势场中的动能项的？在纳米级电磁晶片设计中，高壁势阱中的粒子穿隧效应是如何通过微分边界条件得到的？"
  },
  {
    id: "einstein",
    name: "Einstein Field Equation 爱因斯坦万有引力场方程",
    english: "General Relativity Spacetime Curvature Tensor",
    formula: "R_{\\mu\\nu} - \\frac{1}{2}R g_{\mu\\nu} + \\Lambda g_{\mu\\nu} = \\frac{8\\pi G}{c^4} T_{\mu\\nu}",
    domain: "时空度规 & 黎曼曲率流形",
    description: "宇宙宏观大尺度时空结构的引力微分方程，将四维黎曼流形的弯曲几何，直接与时空内部的质量、动量及压强能流分布相互耦合。",
    operators: [
      { notation: "R_{\\mu\\nu}", meaning: "里奇曲率张量（代表时空几何收缩变率）" },
      { notation: "g_{\mu\\nu}", meaning: "度规张量（度量非欧时空微元距离的一维矩阵）" },
      { notation: "\\Lambda", meaning: "宇宙常数（真空气压级负能斥力阻尼）" },
      { notation: "T_{\mu\\nu}", meaning: "应力-能量-动量张量（刻画所有实物电磁物态分布）" }
    ],
    history: "爱因斯坦于1915年发表，强力推翻了牛顿超距作用说。在史瓦西极坐标球对称、弗里德曼大爆炸膨胀度规划等多个方向上存在完美的闭包解析流形解。",
    chatPrompt: "你好！我对广义相对论中爱因斯坦引力场方程 (Einstein Field Equations) 的几几度规很感兴趣。在时空数值模拟中，如何把这个复杂的二阶非线性偏微分张量方程组投影到离散网格上？史瓦西非平面坐标下的测地线微分方程是如何演进更新粒子轨迹的？"
  },
  {
    id: "maxwell",
    name: "Maxwell Differential Equations 麦克斯韦对称电磁统一场组",
    english: "Electromechanical Wave Propagation Vector Field",
    formula: "\\begin{cases} \\nabla \\cdot \\mathbf{E} = \\frac{\\rho}{\\varepsilon_0} \\\\ \\nabla \\times \\mathbf{E} = -\\frac{\\partial \\mathbf{B}}{\\partial t} \\\\ \\nabla \\cdot \\mathbf{B} = 0 \\\\ \\nabla \\times \\mathbf{B} = \\mu_0 \\mathbf{J} + \\mu_0 \\varepsilon_0 \\frac{\\partial \\mathbf{E}}{\\partial t} \\end{cases}",
    domain: "经典电动力学 & 电磁行波传播",
    description: "将电荷、磁场磁偶极子、位移电流以及电磁感应完美融为一体的偏微分控制方程组，推导出了光速常数与电磁振荡波自持向前发射物理实相。",
    operators: [
      { notation: "\\nabla \\cdot", meaning: "散度算子（算解电磁通量从该散元极点发散出的净流率）" },
      { notation: "\\nabla \\times", meaning: "旋度算子（运算某点闭合向量环的切向剪切振荡环流强度）" },
      { notation: "\\mathbf{E}, \\mathbf{B}", meaning: "自由时空中的瞬时电场强度矢量与磁感应强度矢量" },
      { notation: "\\mathbf{J}", meaning: "宏观自由传导电流密度矢量" },
      { notation: "\\varepsilon_0, \\mu_0", meaning: "真空介电常数与真空磁导率（时空本身的物理边界常量）" }
    ],
    history: "由詹姆斯·克拉克·麦克斯韦于19世纪完成终极统一，惊人地指明了光波本质就是一种高分电磁振荡偏微分行波。是现代无线电、电磁切片雷达的绝对法典。",
    chatPrompt: "请教导师！在电磁切片和高频雷达成像计算中，麦克斯韦方程组的时域有限差分(FDTD)算法在空间二维/三维偏导网格中是如何交替更新电场E和磁场B的（Yee网格理论）？在高损耗损耗介质中，一阶时变偏导与位移电流项如何形成衰减色散波动微分？"
  }
];

export default function CompilerSDK() {
  const [selectedClassicalEq, setSelectedClassicalEq] = useState<string>("ns");
  const [eqCopied, setEqCopied] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<MathModelPreset>(PRESET_MODELS[0]);
  const [activeLang, setActiveLang] = useState<"python" | "matlab" | "webgl">("python");
  const [copied, setCopied] = useState<boolean>(false);
  const [showSdkAlert, setShowSdkAlert] = useState<boolean>(false);
  const [userVars, setUserVars] = useState<Record<string, number>>({
    beta: 0.35,
    gamma: 0.12,
    alpha: 0.65,
    delta: 0.02,
    sigma: 10.0,
    rho: 28.0,
    mu: 2.0,
    viscosity: 0.15,
    density: 1.0,
    hbar: 1.0,
    mass: 1.0,
    cosmological: 0.15,
    gravitational: 1.0,
    frequency: 1.5,
    permittivity: 1.0
  });

  const handleUpdateVar = (key: string, val: number) => {
    setUserVars(prev => ({ ...prev, [key]: val }));
  };

  const getCodeString = (): string => {
    if (activeLang === "python") return selectedModel.generatePython(userVars);
    if (activeLang === "matlab") return selectedModel.generateMatlab(userVars);
    return selectedModel.generateWebGL(userVars);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(getCodeString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="compiler-sdk-section">
      {/* Model & Variable selection sidebar */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        {/* Module Title info */}
        <div className="p-5 rounded-2xl bg-white border border-slate-205 flex flex-col gap-3 shadow-xs font-sans">
          <div className="flex items-center gap-2 text-brand-orange">
            <Code className="w-5 h-5 text-brand-orange" />
            <h3 className="font-display font-semibold text-slate-800 text-sm md:text-base font-mono">数学-代码多端编译中枢</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            如何将高维连续微分方程式，准确、无损地投影落实到离散数值计算机的阵列之中？
            本中枢能够实现常微分控制论在多语言端的标准代码编译。调节下方实值参量，系统可在生成代码内实时注入高精度变常量：
          </p>
        </div>

        {/* Model Presets List */}
        <div className="flex flex-col gap-2.5">
          {PRESET_MODELS.slice(0, 4).map((model) => {
            const isSel = selectedModel.id === model.id;
            return (
              <div
                key={model.id}
                onClick={() => {
                  setSelectedModel(model);
                }}
                className={`p-4 rounded-xl cursor-pointer border transition-all duration-300 flex flex-col gap-2 ${
                  isSel
                    ? "bg-white border-brand-orange shadow-[0_4px_16px_rgba(234,88,12,0.06)]"
                    : "bg-white/70 border-slate-200 hover:border-slate-350 hover:bg-white select-none"
                }`}
              >
                <h4 className="font-display font-bold text-xs text-slate-800">{model.name}</h4>
                <p className="text-[11px] text-slate-450 leading-relaxed font-sans">{model.description}</p>
                
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mt-1 flex items-center justify-between shadow-xs">
                  <div className="text-xs text-brand-orange leading-relaxed font-bold">
                    <MathFormula math={model.mathLatex} block={true} />
                  </div>
                  <Terminal className="w-3.5 h-3.5 text-slate-400 self-end ml-2 shrink-0" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Sliders for Code Template Injection */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col gap-4 shadow-sm">
          <div className="flex justify-between items-center text-xs font-bold text-slate-805 border-b border-slate-100 pb-2">
            <span className="flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5 text-brand-orange animate-pulse" /> 常微分系统实偶参数微调：</span>
            <span className="text-[10px] font-mono text-slate-400">Dynamic Bind</span>
          </div>

          <div className="flex flex-col gap-3">
            {selectedModel.variables.map((variable) => (
              <div key={variable.key} className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-600 font-sans">{variable.name}</span>
                  <span className="font-mono text-brand-orange font-bold bg-brand-orange/10 px-2 py-0.5 rounded text-[11px]">
                    {userVars[variable.key]?.toFixed(3)}
                  </span>
                </div>
                <input
                  type="range"
                  min={variable.min}
                  max={variable.max}
                  step={variable.step}
                  value={userVars[variable.key] ?? variable.defaultValue}
                  onChange={(e) => handleUpdateVar(variable.key, parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded cursor-pointer accent-brand-orange"
                />
                <span className="text-[10px] text-slate-400 leading-normal font-sans">{variable.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compiler output terminals */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        <div className="rounded-2xl border border-slate-250 bg-slate-900 overflow-hidden shadow-sm flex flex-col min-h-[220px] h-auto">
          
          {/* Header tabs lang */}
          <div className="px-4 py-3 border-b border-slate-800 bg-slate-850 flex items-center justify-between select-none">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveLang("python")}
                className={`px-3 py-1 text-xs rounded-md font-mono transition-colors cursor-pointer text-xs font-semibold ${
                  activeLang === "python" ? "bg-brand-orange text-slate-900 font-bold shadow-xs" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Python (SciPy)
              </button>
              <button
                onClick={() => setActiveLang("matlab")}
                className={`px-3 py-1 text-xs rounded-md font-mono transition-colors cursor-pointer text-xs font-semibold ${
                  activeLang === "matlab" ? "bg-brand-orange text-slate-900 font-bold shadow-xs" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                MATLAB (ode45)
              </button>
              <button
                onClick={() => setActiveLang("webgl")}
                className={`px-3 py-1 text-xs rounded-md font-mono transition-colors cursor-pointer text-xs font-semibold ${
                  activeLang === "webgl" ? "bg-brand-orange text-slate-900 font-bold shadow-xs" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                WebGL Shader
              </button>
            </div>

            {/* Actions copy */}
            <button
              onClick={handleCopyCode}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600 transition cursor-pointer font-bold font-sans"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 font-mono">CODE_COPIED</span>
                </>
              ) : (
                <>
                  <ClipboardList className="w-3.5 h-3.5 text-slate-400" />
                  <span>复制代码</span>
                </>
              )}
            </button>
          </div>

          {/* Real code container */}
          <div className="p-4 flex-1 font-mono text-[11px] leading-relaxed overflow-auto max-h-[290px] text-emerald-400 bg-slate-950 shadow-inner">
            <pre className="whitespace-pre select-all text-left">
              <code>{getCodeString()}</code>
            </pre>
          </div>

          {/* Environment stats */}
          <div className="px-4 py-2.5 border-t border-slate-800 bg-slate-900 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              <Terminal className="w-3" /> STATUS: COMPILE_SUCCESS | ODE45_INTEGRATED
            </span>
            <span>OUTFILE: run_simulation.py (720B)</span>
          </div>
        </div>

        {/* Dynamic developer open-source card */}
        <div className="relative p-4 rounded-xl bg-slate-100/50 border border-slate-200 flex items-center justify-between shadow-xs overflow-hidden">
          <div className="flex flex-col gap-0.5">
            <h5 className="font-display font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <Github className="w-4 h-4 text-slate-700" /> 微积分物理世界开源 SDK V1.0.8
            </h5>
            <p className="text-[10px] text-slate-400 font-sans">支持一键流元提取任意生态或力学微元控制组，加速多进程并行计算。</p>
          </div>

          <button 
            onClick={() => {
              setShowSdkAlert(true);
              setTimeout(() => setShowSdkAlert(false), 4500);
            }}
            className="py-1.5 px-3 bg-brand-orange/10 border border-brand-orange/40 hover:bg-brand-orange/20 rounded-lg text-[10px] font-mono text-brand-orange font-bold hover:shadow-xs cursor-pointer select-none shrink-0 transition-colors"
          >
            GET INTEGRATED PKG →
          </button>

          {showSdkAlert && (
            <div className="absolute inset-0 bg-white/95 flex items-center justify-between px-4 py-2 border-l-4 border-brand-orange animate-in fade-in slide-in-from-bottom duration-350">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-slate-800 font-sans">【SDK 离线接口准备就位】</span>
                <span className="text-[10px] text-slate-500 font-sans mt-0.5">标准的 ODEs 离线控制包现已挂载！您可以直接进行离线部署。</span>
              </div>
              <button 
                onClick={() => setShowSdkAlert(false)} 
                className="text-[10px] text-brand-orange hover:text-brand-orange font-bold font-sans cursor-pointer px-2.5 py-1 rounded-md bg-brand-orange/10 border border-brand-orange/20 mr-1"
              >
                知道了
              </button>
            </div>
          )}
        </div>

        {/* 经典物理微分与场论控制元典藏仓 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-205 shadow-xs flex flex-col gap-4 mt-2" id="classical-tensors-repository">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4.5 h-4.5 text-brand-orange" />
              <h4 className="font-display font-bold text-xs uppercase text-slate-800 tracking-wider">
                经典物理微分与场论控制元典藏仓
              </h4>
            </div>
            <span className="text-[9.5px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-150 font-bold">
              PHYSICS_TENSORS
            </span>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
            下表精选了物理学中描述时空几何、宏观流变及微观波态最不朽的四大家族经典偏微分方程。点击任一控制元，下方即时展开其微积分偏微分算子几何分解：
          </p>

          {/* Equation switcher tags */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {CLASSICAL_EQUATIONS.map((eq) => {
              const ixS = selectedClassicalEq === eq.id;
              return (
                <button
                  key={eq.id}
                  onClick={() => {
                    setSelectedClassicalEq(eq.id);
                    const matchingModel = PRESET_MODELS.find(m => m.id === eq.id);
                    if (matchingModel) {
                      setSelectedModel(matchingModel);
                    }
                  }}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer select-none h-18 ${
                    ixS
                      ? "bg-slate-900 border-slate-950 text-white shadow-md transform scale-[1.02]"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-350"
                  }`}
                >
                  <span className={`text-[9px] font-bold font-mono uppercase tracking-wider block ${ixS ? "text-brand-orange" : "text-slate-400"}`}>
                    {eq.domain.split(" & ")[0]}
                  </span>
                  <span className="font-display font-extrabold text-[10.5px] line-clamp-1 leading-tight mt-1">
                    {eq.name.split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active selected classical formula layout detail card */}
          {(() => {
            const activeEq = CLASSICAL_EQUATIONS.find((e) => e.id === selectedClassicalEq) || CLASSICAL_EQUATIONS[0];
            return (
              <div className="rounded-xl border border-slate-150 bg-slate-50/50 p-4 flex flex-col gap-3.5 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/50">
                  <div>
                    <h5 className="font-display font-bold text-xs text-slate-800">
                      {activeEq.name}
                    </h5>
                    <p className="text-[9.5px] text-slate-400 font-mono mt-0.5">
                      {activeEq.english}
                    </p>
                  </div>
                  <span className="text-[9.5px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-150 font-bold self-start sm:self-center">
                    {activeEq.domain}
                  </span>
                </div>

                {/* Golden math formula output stage */}
                <div 
                  onClick={() => {
                    const matchingModel = PRESET_MODELS.find(m => m.id === activeEq.id);
                    if (matchingModel) {
                      setSelectedModel(matchingModel);
                    }
                  }}
                  className="flex items-center justify-center py-4 px-6 bg-amber-500/[0.04] border border-amber-200/50 rounded-xl max-w-full overflow-x-auto shadow-inner relative group select-all min-h-16 hover:border-amber-400 hover:bg-amber-500/10 cursor-pointer transition-all"
                  title="点击将此经典方程式一键同步多端编译"
                >
                  <div className="text-center text-slate-800 text-sm md:text-base font-bold select-all font-mono">
                    <MathFormula math={activeEq.formula} block={true} />
                  </div>
                  <span className="absolute top-1.5 right-1.5 text-[8.5px] font-mono text-amber-600/60 leading-none font-bold">
                    TENSOR_FIELD (点击同步多端编译)
                  </span>
                </div>

                {/* Operator definitions breakdown column */}
                <div className="flex flex-col gap-1 pb-1">
                  <span className="text-[9.5px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                    微分算子与参量物理拆解 (Coefficient Parse)
                  </span>
                  <div className="flex flex-col gap-1 text-slate-700 text-[11px] font-sans">
                    {activeEq.operators.map((op, idx) => (
                      <div key={idx} className="flex items-center gap-2 py-0.5">
                        <div className="shrink-0 min-w-[75px] flex items-center justify-start">
                          <MathFormula math={op.notation} block={false} className="text-brand-orange font-bold text-[10.5px]" />
                        </div>
                        <span className="text-slate-300 select-none">•</span>
                        <span className="text-slate-600 leading-normal select-all">{op.meaning}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* History insight box */}
                <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 leading-relaxed flex gap-2.5 items-start">
                  <HelpCircle className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      学术引申 & 数学大厦背景
                    </span>
                    <p className="text-[10px] font-sans text-slate-500 mt-1">
                      {activeEq.history}
                    </p>
                  </div>
                </div>

                {/* Action hub buttons */}
                <div className="flex flex-col sm:flex-row gap-2 pt-1 border-t border-slate-200/50">
                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(activeEq.formula);
                        setEqCopied(true);
                        setTimeout(() => setEqCopied(false), 2000);
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                    className="flex-1 py-1.5 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[10px] font-sans font-bold text-slate-700 hover:text-slate-900 shadow-xs cursor-pointer text-center select-none flex items-center justify-center gap-1.5 transition-all"
                  >
                    {eqCopied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500 animate-pulse" />
                        <span className="text-emerald-500 font-mono">LATEX_COPIED</span>
                      </>
                    ) : (
                      <>
                        <ClipboardList className="w-3 h-3 text-slate-400" />
                        <span>复制 LaTeX 公式源码</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      const event = new CustomEvent("ask-academic-chat", {
                        detail: { query: activeEq.chatPrompt }
                      });
                      window.dispatchEvent(event);
                    }}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-700 text-[10px] font-sans font-bold shadow-xs cursor-pointer text-center select-none flex items-center justify-center gap-1.5 transition-all md:relative group overflow-hidden"
                  >
                    <Sparkles className="w-3 h-3 text-indigo-200 animate-pulse" />
                    <span>与 AI 导师追问本课题</span>
                    <ArrowRight className="w-3 h-3 text-indigo-200 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
