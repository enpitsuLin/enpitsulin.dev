---
title: 指出别人漏洞百出前先做好阅读理解
slug: the-arrogance-of-skipping-context
tags:
  - CSS
publishedAt: 2025-12-09T18:21:00.000Z
---

最近看到一个[观点](https://www.bilibili.com/video/BV1cAKUzMEW7){rel="&#x22;nofollow&#x22;"}实在觉得难以苟同，所以花了点时间记录一下，

> 本身是对别人视频的抨击，但是整体来说还是变成了对 CSS 发展的回顾。
> 整体来说原子化 CSS 已经在 AI 时代不可阻挡了，无论是否有偏见，多学多用，保证不亏

他一开始就抛出了他的观点，就是[这篇文章](https://adamwathan.me/css-utility-classes-and-separation-of-concerns/){rel="&#x22;nofollow&#x22;"}内容可笑，但殊不知是自己根本没有理解文章内容的情况下，把其中一小部分的内容作为文章整体观点进行批判。突出自己没有阅读能力的同时，理解力也很低下，以及个人素质不太达标。

为什么这么说呢，先来看看一开始说的一些内容。

![](https://enpitsulin.dev/assets/H3X3wK1PlNTybERJnyjX9L-H3BMgupOMAiZzU2f1b-k=.png)

首先就说了自己没耐心看完啊，本身我确实也对 tailwind 的好感一般，但是单纯从文章角度来说没什么问题，然后我们看下文章一开头其实就已经把 Adam 本文结构已经阐明。

> Over the last several years, the way I write CSS has transitioned from a very "semantic" approach to something much more like what is often called "functional CSS."

所以整篇文章是一个什么样的结构？是以一个历史发展的角度去剖析 css 的发展并最终引出原子化 css 和自荐基于 postcss 的 tailwind。所以如果能看完整篇文章并且能理解这篇文章，根本不会有如此傲慢的问题。

![](https://enpitsulin.dev/assets/et9mItWbQeOxSeSPzaBOixr8w0sKA4kYwVfJpIFptP4=.png)

首先我们要尝试理解这篇文章的叙事和讨论内容，不可避免的需要先了解为什么网页开发有“关注点分离”这个概念

如果大家有了解过早期开发网页的时期，将\*\*结构（HTML）、表现（CSS）和行为（JavaScript）\*\*分离到不同的文件或代码块中的优点是显著的，可以让 JavaScript 开发和网页设计分开便于当时的方式独立进行协作完成任务。

所以结构的“语义”是很重要的，结构必须要能描述它本身，这样在将结构和表现分离的时候就可以不需要同时关注两边，减少了混乱，所以文章的一开始就是

## **Phase 1: "Semantic" CSS**

代表的是这个时代的实践方式。

```html
<p class="text-center">
    Hello there!
</p>
```

`.text-center` 是将表现（居中）赋予了结构，所以应该使用 `.greeting` 代表居中的文本

```html
<style>
.greeting {
    text-align: center;
}
</style>

<p class="greeting">
    Hello there!
</p>
```

举了个比较实际的例子 `.author-bio` 代表会有如下**结构** `div.author-bio>img+(div>h2+p)` 是会有这样的**表现** （通过嵌套语法表示）

```css
.author-bio {
  background-color: white;
  border: 1px solid hsl(0,0%,85%);
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
  > img {
    display: block;
    width: 100%;
    height: auto;
  }
  > div {
    padding: 1rem;
    > h2 {
      font-size: 1.25rem;
      color: rgba(0,0,0,0.8);
    }
    > p {
      font-size: 1rem;
      color: rgba(0,0,0,0.75);
      line-height: 1.5;
    }
  }
}
```

随后抛出了问题，这也是时代发展后大家意识到的问题，通过一个类名和固定结构，其实反向让**表现**关注**结构**，即 css 必须要 `.author-bio` 以这样的结构编写。

> 这也是视频主要攻击的问题，当然，他不仅没理解举例的作用，还要再后面评价 BEM 很糟也是无端。

![](https://enpitsulin.dev/assets/3VVDD_8tgiJoVP46NMNC_1bNrrI4EiO1Umpny7fYdXE=.png)

## **Phase 2: Decoupling styles from structure**

这个时期 BEM 的实践出现，目标是通过一个约定的命名方式，来明确地描述UI组件各个部分之间的关系，从而避免冲突的同时创建一个清晰的CSS架构。

这确实是一个巨大的进步，起码冲突不会那么容易出现，**表现**不在关注实际\*&#x2A;结构。*\*

![](https://enpitsulin.dev/assets/gOMEzQSdTGnvNt3jB72ukYPBElenF13t1Wi4_JyUPKI=.png)

> 我觉得哪怕以现在的眼光来看，BEM 通过约定命名层面类似一种手动组织作用域的方式解决了：该如何分离**结构**和**表现**、如何避免样式冲突，甚至时至今日现代 CSS 的 @layer、@scope 本质也是解决这一类问题。
> 当然我也不知道所谓的第三方工具是什么，如果早就有这个东西我想也不至于出现 BEM，甚至也没必要加 @layer @scope 了

但是问题来了，如果创建**结构**和**表现**看起来都相当相似的组件该怎么办？因为我们通过 BEM 定义了固定的具有语义的块 `author-bio` 如果直接在新的 Article preview 使用，就不符合语义了。

简单的解决方案，无论是复制修改，还是利用预处理器去防止重复定义。

或者把两者的语义统一成 `.media-card`

于是最大的问题来了，要是未来还有类似的情况发生呢？又不得不去统一这个语义，然后把所有 `.media-card` 的结构再修改类名，这看起来太繁琐了。

而且不可避免的又让**结构**关注实际**表现**了

于是接下来真正进入正题，提出最核心，最直击"关注点分离"理论的问题

> 可重新设计的 HTML 和可重用的 CSS，哪个更有价值？

实际上就是下面两种方案你能接受那种？

1. **结构**更重要，**结构**正确，**表现**可以随意调整，`div.author-bio>img+(div>h2+p)` 就得这么写，后面想调整表现就可以随意“换肤”
2. **表现**更重要，**结构**可以完全不一致，但是无论在哪里 `.btn.btn-primary` 一定是蓝色按钮。

## **Phase 3: Content-agnostic CSS components**

这一部分是为了彻底击碎“关注点分离”的补充。

核心新时代的 Web 开发，就是复用 CSS 是需求更大的。如果要从组件级别的CSS进行复用，随着组件功能越来越复杂是肯定会越来越困难的。

> **The more a component does, or the more specific a component is, the harder it is to reuse.**

为什么？核心问题就是新增调整细微的差距需要新的样式去实现，但是可能用到的几率很低。

> But what if one of these actions lists was supposed to be left justified, and the other was supposed to be right justified? Do we make`.actions-list--left`and`.actions-list--right`modifiers?

所以 Adam 在下面提出“代码复用”的新思路是，使用尽可能更容易重用的“组件”去组合出实际的组件，而不是从实际的组件挑出可以复用的部分。

## **Phase 4: Content-agnostic components + utility classes**

核心在于指出——\*&#x2A;传统的“关注点分离”是为了优化一个根本不需要的场景（随意“换肤”），却牺牲了最需要的特性（复用 CSS）。*\*

与其假装 HTML 和 CSS 是分离的，不如接受它们是耦合的现实，然后通过更容易复用的 `utility first` 工具类来编写样式，并将真正的逻辑抽象交给现代框架的“组件”去处理。

后面的阶段就没什么好说得了，至此，Tailwind CSS 的诞生已是水到渠成。

其实 Tailwind CSS 本身的思想并不是一个新的点子，只不过是时代发展和机遇造就了 Tailwind，一开始一大坨产物需要 purge ，被 windcss 赶着匆匆忙忙连滚带爬的上了 JIT，又赶上了 AI 的风口，只能说时也命也。

当然最后，此人的观点整体来说就是狗屁不通，属于完全没看明白文章内容就急着抓住一个看起来像问题的点就输出，着实可笑。最后也是喜提拉黑🤣

![](https://enpitsulin.dev/assets/qTNn73RvLddbeGJvN29LyBj7Hil5eJBdywyHAoM9vPg=.png)
