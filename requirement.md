Viết cho tôi muốn chrome extension có thể edit html của trang web https://openquiz.ai/study-set/{n}  (n là một số).
Tôi sẽ cho bạn tham khảo code html của web với url trong @demo_web.html.
Nhiệm vụ của bạn là khi vào web với url như trên thì tiến hành update lại code trong html theo mô tả sau (Lưu ý web có thể update lại code user tương tác, bạn cần update lại code mỗi khi html update lại ở url như trên):
Trong code html sẽ có một đoạn như sau:
<div class="relative cursor-pointer group"><div class="blur-sm select-none pointer-events-none"><div class="text-muted-foreground text-center space-y-1 text-sm"><p>proportionate to; corresponding to; equal to</p><p class="italic whitespace-pre-line">Your salary will be commensurate with your experience.</p></div></div><div class="absolute inset-0 flex items-center justify-center"><div class="bg-gray-900/90 dark:bg-gray-800/90 rounded-full p-1 group-hover:scale-110 transition-transform shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lock w-3 h-3 text-white"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></div></div></div>

Udpate lại ở chỗ:
- class "blur-sm select-none pointer-events-none" => bỏ "blur-sm" đi.
- Bỏ luôn div con thứ hai đi. Ở ví dụ là "<div class="absolute inset-0 flex items-center justify-center"><div class="bg-gray-900/90 dark:bg-gray-800/90 rounded-full p-1 group-hover:scale-110 transition-transform shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lock w-3 h-3 text-white"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></div></div>"


Code bằng tyscript.