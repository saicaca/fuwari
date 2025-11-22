<script lang="ts">
  import { onMount } from 'svelte';
  import { commentConfig } from '@/config';

  let container: HTMLElement;
  let qqInput: string = '';
  let isLoading = false;
  let currentAvatar: string = '';

  // 多源 API 列表
  const API_LIST = [
    (qq: string) => `https://api.usuuu.com/qq/${qq}`,
    (qq: string) => `https://api.qjqq.cn/api/qqinfo?qq=${qq}`,
    (qq: string) => `https://api.uomg.com/api/qq.info?qq=${qq}`
  ];

  onMount(async () => {
    if (!commentConfig.enable || commentConfig.type !== 'waline') return;
    const { init } = await import('@waline/client');
    await import('@waline/client/style');

    init({
      el: container,
      serverURL: commentConfig.waline.serverURL,
      lang: commentConfig.waline.lang,
      dark: 'html.dark', 
      pageSize: commentConfig.waline.pageSize,
      pageview: commentConfig.waline.pageview,
      reaction: false,
      requiredMeta: commentConfig.waline.requiredMeta,
      emoji: ['//unpkg.com/@waline/emojis@1.2.0/bilibili'],
    });
  });

  async function handleQQFetch() {
    if (!/^[1-9][0-9]{4,10}$/.test(qqInput)) {
        showErrorInInput('nick', 'QQ号格式错误');
        return;
    }

    isLoading = true;
    const qq = qqInput;
    let fetchSuccess = false;

    // 1. 设置头像
    currentAvatar = `https://q1.qlogo.cn/g?b=qq&nk=${qq}&s=640`;
    
    // 2. 填充邮箱
    updateWalineInput('mail', `${qq}@qq.com`);

    // 3. API 获取昵称
    for (const apiGen of API_LIST) {
        try {
            const url = apiGen(qq);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            const res = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);
            const data = await res.json();
            const nickname = data.name || data.nickname || data.qname || data.data?.name;

            if (nickname) {
                updateWalineInput('nick', nickname);
                fetchSuccess = true;
                break;
            }
        } catch (e) {
            continue;
        }
    }

    if (!fetchSuccess) {
        showErrorInInput('nick', '获取失败，请手动输入');
    }
    isLoading = false;
  }

  function showErrorInInput(name: string, errorMsg: string) {
    const input = container.querySelector(`input[name="${name}"]`) as HTMLInputElement;
    if (input) {
        input.value = '';
        input.placeholder = errorMsg;
        input.classList.add('input-error-placeholder');
        setTimeout(() => {
            input.classList.remove('input-error-placeholder');
            if (name === 'nick') input.placeholder = '昵称';
        }, 3000);
    }
  }

  function updateWalineInput(name: string, value: string) {
    const input = container.querySelector(`input[name="${name}"]`) as HTMLInputElement;
    if (input) {
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') handleQQFetch();
  }
</script>

<div class="waline-wrapper">
    <div class="qq-bar-minimal">
        <div class="avatar-preview" class:has-avatar={!!currentAvatar}>
            {#if currentAvatar}
                <img src={currentAvatar} alt="QQ" />
            {:else}
                <div class="placeholder-icon">
                    <span class="iconify" data-icon="fa6-solid:user"></span>
                </div>
            {/if}
        </div>

        <div class="input-row">
            <input 
                type="number" 
                placeholder="输入QQ号，自动识别头像昵称" 
                bind:value={qqInput}
                on:keydown={handleKeydown}
                disabled={isLoading}
            />
            <button class="btn-text" on:click={handleQQFetch} disabled={isLoading}>
                {#if isLoading}
                    加载中...
                {:else}
                    获取
                {/if}
            </button>
        </div>
    </div>

    <div bind:this={container} class="waline-clean"></div>
</div>

<style is:global>
  /* 全局变量 */
  :root {
    --waline-theme-color: var(--primary);
    --waline-active-color: var(--primary);
    --waline-border-color: var(--line-divider);
    --waline-bg-color-light: transparent; /* 强制透明 */
  }

  .waline-wrapper {
    position: relative;
    /* 去掉外面的大框框，让它融入页面 */
    width: 100%;
  }

  /* --- QQ 栏 (极简风格) --- */
  .qq-bar-minimal {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem 0.5rem 1rem 0.5rem; /* 底部留点空隙给分割线 */
    
    /* 关键：只留底部的虚线，不加背景色 */
    border-bottom: 1px dashed var(--line-divider);
    margin-bottom: 0; 
  }

  /* 头像圆圈 */
  .avatar-preview {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background: var(--btn-content); /* 只有头像底座有点灰色 */
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    flex-shrink: 0;
    transition: all 0.3s;
  }
  .avatar-preview.has-avatar {
    box-shadow: 0 0 0 2px var(--primary); /* 获取成功后亮起 */
  }
  .avatar-preview img { width: 100%; height: 100%; object-fit: cover; }
  .placeholder-icon { color: #ccc; font-size: 1rem; }

  /* 输入框容器 */
  .input-row {
    flex: 1;
    display: flex;
    align-items: center;
    /* 去掉灰色背景，变成透明 */
    background: transparent;
  }

  .input-row input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    font-size: 0.95rem;
    color: var(--text-main, inherit);
    padding: 0.5rem 0;
  }
  
  /* 纯文字按钮，更干净 */
  .btn-text {
    background: transparent;
    color: var(--primary);
    border: none;
    font-size: 0.9rem;
    font-weight: bold;
    cursor: pointer;
    padding: 0 0.5rem;
    transition: opacity 0.2s;
  }
  .btn-text:hover { opacity: 0.7; }
  .btn-text:disabled { opacity: 0.4; cursor: not-allowed; }

  /* --- Waline 样式微调 --- */
  
  /* 1. 让 Waline 的昵称栏紧贴虚线 */
  .waline-clean .wl-header {
    margin: 0 !important;
    padding: 1rem 0.5rem !important; /* 上下给点间距 */
    border-bottom: 1px solid var(--line-divider) !important;
    border-radius: 0 !important;
    background: transparent !important;
  }
  
  /* 2. 让 Waline 输入框透明化 */
  .waline-clean .wl-header input {
    background: transparent !important;
  }

  /* 3. 评论框本体 */
  .waline-clean .wl-editor {
    margin: 1rem 0 !important;
    padding: 1rem !important;
    background: var(--btn-content) !important; /* 只有输入大框有点背景色 */
    border-radius: 1rem !important;
    min-height: 8rem !important;
    border: 1px solid transparent !important;
  }
  .waline-clean .wl-editor:focus-within {
    background: var(--card-bg) !important;
    border-color: var(--primary) !important;
  }

  /* 4. 底部按钮 */
  .waline-clean .wl-footer {
    margin: 0 0.5rem !important;
  }
  
  .input-error-placeholder::placeholder {
    color: #ff4e4e !important;
  }
</style>