---
title: KaTeX Example
published: 2025-02-02T00:00:00+00:00
description: How math looks in Markdown using KaTeX.
tags: [Markdown, Blogging, Demo]
category: Examples
draft: false
---

## Inline Math Mode

You can include math directly in your text with single dollar signs (\$).
This is useful for short math within a sentence. For example:

```markdown
This is an inline equation $a^2+b^2=c^2$ in a sentence.
```

This is an inline equation $a^2+b^2=c^2$ in a sentence.

## Display Math Mode

For longer or more complex math, use double dollar signs (\$\$).
This puts the math on a new line with extra space around it. For example:

```markdown
$$ 
a^2+b^2=c^2
$$
```

$$
a^2+b^2=c^2
$$

```markdown
$$
\begin{equation*}
\pi
=3+\frac{1^{2}}{6+\frac{3^{2}}{6+\frac{5^{2}}{6+\frac{7^{2}}{6+\frac{9^{2}}{6+\frac{11^{2}}{\ddots}}}}}}
\end{equation*}
$$
```

$$
\begin{equation*}
\pi
=3+\frac{1^{2}}{6+\frac{3^{2}}{6+\frac{5^{2}}{6+\frac{7^{2}}{6+\frac{9^{2}}{6+\frac{11^{2}}{\ddots}}}}}}
\end{equation*}
$$

```markdown
$$
\begin{equation*}
  \begin{split}
  f(x)
  &=\sum^{\infty}_{n=0} \frac{f^{(n)}(a)}{n!} (x-a)^{n}\\
  &=f(a) + f^{'}(a)(x-a) + \frac{f^{''}(a)}{2!}(x-a)^{2}\\
  &\quad + \frac{f^{'''}(a)}{3!}(x-a)^{3} + \frac{f^{''''}(a)}{4!}(x-a)^{4} + \cdots
  \end{split}
\end{equation*}
$$
```

$$
\begin{equation*}
  \begin{split}
  f(x)
  &=\sum^{\infty}_{n=0} \frac{f^{(n)}(a)}{n!} (x-a)^{n}\\
  &=f(a) + f^{'}(a)(x-a) + \frac{f^{''}(a)}{2!}(x-a)^{2}\\
  &\quad + \frac{f^{'''}(a)}{3!}(x-a)^{3} + \frac{f^{''''}(a)}{4!}(x-a)^{4} + \cdots
  \end{split}
\end{equation*}
$$

```markdown
$$
\begin{equation*}
e=2.
7182818284\;5904523536\;0287471352\;6624977572\;4709369995\;9574966967
6277240766\;3035354759\;4571382178\;5251664274\;2746639193\;2003059921\;\ldots
\end{equation*}
$$
```

$$
\begin{equation*}
e=2.
7182818284\;5904523536\;0287471352\;6624977572\;4709369995\;9574966967
6277240766\;3035354759\;4571382178\;5251664274\;2746639193\;2003059921\;\ldots
\end{equation*}
$$

```markdown
$$
\begin{align*}
AB
&=
\begin{pmatrix}
a_{11} & a_{12} & \cdots & a_{1n}\\
a_{21} & a_{22} & \cdots & a_{2n}\\
\vdots & \vdots & \ddots & \vdots\\
a_{m1} & a_{m2} & \cdots & a_{mn}
\end{pmatrix}
\begin{pmatrix}
b_{11} & b_{12} & \cdots & b_{1p}\\
b_{21} & b_{22} & \cdots & b_{2p}\\
\vdots & \vdots & \ddots & \vdots\\
b_{n1} & b_{n2} & \cdots & b_{np}
\end{pmatrix}\\
&=
\begin{pmatrix}
a_{11} b_{11} + a_{12} b_{21} + \cdots + a_{1n} b_{n1} &
a_{11} b_{12} + a_{12} b_{22} + \cdots + a_{1n} b_{n2} &
\cdots &
a_{11} b_{1p} + a_{12} b_{2p} + \cdots + a_{1n} b_{np}\\
a_{21} b_{11} + a_{22} b_{21} + \cdots + a_{2n} b_{n1} &
a_{21} b_{12} + a_{22} b_{22} + \cdots + a_{2n} b_{n2} &
\cdots &
a_{21} b_{1p} + a_{22} b_{2p} + \cdots + a_{2n} b_{np}\\
\vdots & \vdots & \ddots & \vdots\\
a_{m1} b_{11} + a_{m2} b_{21} + \cdots + a_{mn} b_{n1} &
a_{m1} b_{12} + a_{m2} b_{22} + \cdots + a_{mn} b_{n2} &
\cdots &
a_{m1} b_{1p} + a_{m2} b_{2p} + \cdots + a_{mn} b_{np}
\end{pmatrix}\\
&=
\begin{pmatrix}
\sum^{n}_{k=1} a_{1k} b_{k1} & \sum^{n}_{k=1} a_{1k} b_{k2} & \cdots & \sum^{n}_{k=1} a_{1k} b_{kp}\\
\sum^{n}_{k=1} a_{2k} b_{k1} & \sum^{n}_{k=1} a_{2k} b_{k2} & \cdots & \sum^{n}_{k=1} a_{2k} b_{kp}\\
\vdots & \vdots & \ddots & \vdots\\
\sum^{n}_{k=1} a_{mk} b_{k1} & \sum^{n}_{k=1} a_{mk} b_{k2} & \cdots & \sum^{n}_{k=1} a_{mk} b_{kp}
\end{pmatrix}\\
&=
\begin{pmatrix}
c_{11} & c_{12} & \cdots & c_{1p}\\ 
c_{21} & c_{22} & \cdots & c_{2p}\\
\vdots & \vdots & \ddots & \vdots\\
c_{m1} & c_{m2} & \cdots & c_{mp}
\end{pmatrix}
=C
\end{align*}
$$
```

$$
\begin{align*}
AB
&=
\begin{pmatrix}
a_{11} & a_{12} & \cdots & a_{1n}\\
a_{21} & a_{22} & \cdots & a_{2n}\\
\vdots & \vdots & \ddots & \vdots\\
a_{m1} & a_{m2} & \cdots & a_{mn}
\end{pmatrix}
\begin{pmatrix}
b_{11} & b_{12} & \cdots & b_{1p}\\
b_{21} & b_{22} & \cdots & b_{2p}\\
\vdots & \vdots & \ddots & \vdots\\
b_{n1} & b_{n2} & \cdots & b_{np}
\end{pmatrix}\\
&=
\begin{pmatrix}
a_{11} b_{11} + a_{12} b_{21} + \cdots + a_{1n} b_{n1} &
a_{11} b_{12} + a_{12} b_{22} + \cdots + a_{1n} b_{n2} &
\cdots &
a_{11} b_{1p} + a_{12} b_{2p} + \cdots + a_{1n} b_{np}\\
a_{21} b_{11} + a_{22} b_{21} + \cdots + a_{2n} b_{n1} &
a_{21} b_{12} + a_{22} b_{22} + \cdots + a_{2n} b_{n2} &
\cdots &
a_{21} b_{1p} + a_{22} b_{2p} + \cdots + a_{2n} b_{np}\\
\vdots & \vdots & \ddots & \vdots\\
a_{m1} b_{11} + a_{m2} b_{21} + \cdots + a_{mn} b_{n1} &
a_{m1} b_{12} + a_{m2} b_{22} + \cdots + a_{mn} b_{n2} &
\cdots &
a_{m1} b_{1p} + a_{m2} b_{2p} + \cdots + a_{mn} b_{np}
\end{pmatrix}\\
&=
\begin{pmatrix}
\sum^{n}_{k=1} a_{1k} b_{k1} & \sum^{n}_{k=1} a_{1k} b_{k2} & \cdots & \sum^{n}_{k=1} a_{1k} b_{kp}\\
\sum^{n}_{k=1} a_{2k} b_{k1} & \sum^{n}_{k=1} a_{2k} b_{k2} & \cdots & \sum^{n}_{k=1} a_{2k} b_{kp}\\
\vdots & \vdots & \ddots & \vdots\\
\sum^{n}_{k=1} a_{mk} b_{k1} & \sum^{n}_{k=1} a_{mk} b_{k2} & \cdots & \sum^{n}_{k=1} a_{mk} b_{kp}
\end{pmatrix}\\
&=
\begin{pmatrix}
c_{11} & c_{12} & \cdots & c_{1p}\\ 
c_{21} & c_{22} & \cdots & c_{2p}\\
\vdots & \vdots & \ddots & \vdots\\
c_{m1} & c_{m2} & \cdots & c_{mp}
\end{pmatrix}
=C
\end{align*}
$$

## ✨ *Euler's formula:* $e^{ix}=\cos{x}+i\sin{x}$

$$
\begin{align*}
e^{ix}
&=1 + ix + \frac{(ix)^{2}}{2!} + \frac{(ix)^{3}}{3!} + \frac{(ix)^{4}}{4!}
         + \frac{(ix)^{5}}{5!} + \frac{(ix)^{6}}{6!} + \frac{(ix)^{7}}{7!}
         + \frac{(ix)^{8}}{8!} + \cdots\\
&=1 + ix - \frac{x^{2}}{2!} - \frac{ix^{3}}{3!} + \frac{x^{4}}{4!}
         + \frac{ix^{5}}{5!} - \frac{x^{6}}{6!} - \frac{ix^{7}}{7!}
         + \frac{x^{8}}{8!} + \cdots\\
&=\left(1 - \frac{x^{2}}{2!} + \frac{x^{4}}{4!} - \frac{x^{6}}{6!} + \frac{x^{8}}{8!} - \cdots\right)
 + i\left(x - \frac{x^{3}}{3!} + \frac{x^{5}}{5!} - \frac{x^{7}}{7!} + \cdots\right)\\
&=\cos{x}+i\sin{x}
\end{align*}
$$
