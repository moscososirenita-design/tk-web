# ui 目录说明

`components/ui` 现在按组件职责拆分为多个子目录：

- `actions`：按钮、切换类交互组件
- `display`：卡片、表格、头像、图表、分隔线等展示组件
- `feedback`：Toast、Alert、Skeleton、Progress 等反馈组件
- `forms`：Input、Select、Checkbox、Form 等表单组件
- `navigation`：Tabs、Pagination、Sidebar、Breadcrumb 等导航组件
- `overlay`：Dialog、Popover、Dropdown、Tooltip 等浮层组件
- `hooks`：与 UI 组件配套的 hooks

这样拆分的目的，是让组件职责更直观，后续查找和维护时不用在同一个文件夹里翻几十个文件。
