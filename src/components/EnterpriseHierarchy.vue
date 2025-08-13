<template>
  <div class="enterprise-management">
    <div class="header">
      <h1>企业信息管理</h1>
    </div>

    <div class="search-area card">
      <!-- 级联选择器 -->
      <ElCascader
        v-model="selectedEnterpriseIds"
        :options="enterpriseTree"
        :props="cascaderProps"
        placeholder="选择企业"
        multiple
        collapse-tags
        :max-collapse-tags="3"
        style="width: 300px; margin-right: 15px"
        class="cascader-custom"
        filterable
        :filter-method="filterEnterprise"
      />

     <!-- 添加查询按钮 -->
      <ElButton type="primary" @click="handleQuery" style="margin-right: 15px" class="btn-primary">查询</ElButton>
      <ElButton @click="resetSelection" class="btn-secondary">重置选择</ElButton>
    </div>

    <!-- 企业详情列表 -->
    <div class="enterprise-detail card" v-if="currentEnterprises.length > 0">
      <h2>企业详情列表</h2>
      <ElTable :data="pagedEnterprises" border style="width: 100%" class="custom-table">
        <ElTableColumn prop="id" label="企业ID" width="100"></ElTableColumn>
        <ElTableColumn prop="name" label="企业名称"></ElTableColumn>
        <ElTableColumn prop="parentName" label="上级企业">
          <template #default="scope">{{ scope.row.parentName || '无' }}</template>
        </ElTableColumn>
        <ElTableColumn prop="address" label="企业地址"></ElTableColumn>
        <ElTableColumn prop="phone" label="联系电话" width="150"></ElTableColumn>
        <ElTableColumn prop="email" label="企业邮箱"></ElTableColumn>
      </ElTable>

      <!-- 添加分页控件 -->
      <div class="pagination">
        <ElPagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20]"
          :total="currentEnterprises.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 无选择提示 -->
    <div v-else class="no-selection">
      <ElEmpty description="请选择企业并点击查询"></ElEmpty>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { ElButton, ElTable, ElTableColumn, ElPagination, ElEmpty, ElMessage, ElTag } from 'element-plus';

// 级联选择器配置
const cascaderProps = {
  value: 'id',
  label: 'name',
  children: 'children',
  checkStrictly: true,
  emitPath: false,  // 新增：确保返回ID数组而非路径数组
  multiple: true
};

// 添加企业名称模糊匹配过滤方法
const filterEnterprise = (value, data) => {
  // 检查数据是否存在
  if (!data || !data.name) return false;

  // 如果没有搜索关键词，显示所有节点
  if (!value) return true;

  // 将搜索关键词转换为小写
  const keyword = value.toLowerCase();
  // 检查当前节点名称是否包含关键词
  const currentNodeMatch = data.name.toLowerCase().includes(keyword);

  // 如果当前节点不匹配，检查是否有子节点并递归搜索
  if (!currentNodeMatch && data.children && data.children.length > 0) {
    return data.children.some(child => filterEnterprise(value, child));
  }

  return currentNodeMatch;
};

// 示例企业数据
const enterpriseData = [
  {
    id: 1,
    name: '总公司',
    parentId: null,
    parentName: null,
    address: '北京市朝阳区建国路88号',
    phone: '010-12345678',
    email: 'head@example.com',
    hasChildren: true
  },
  {
    id: 2,
    name: '华东分公司',
    parentId: 1,
    parentName: '总公司',
    address: '上海市浦东新区陆家嘴',
    phone: '021-12345678',
    email: 'east@example.com',
    hasChildren: true
  },
  {
    id: 3,
    name: '华北分公司',
    parentId: 1,
    parentName: '总公司',
    address: '北京市海淀区中关村',
    phone: '010-87654321',
    email: 'north@example.com',
    hasChildren: true
  },
  {
    id: 4,
    name: '上海子公司',
    parentId: 2,
    parentName: '华东分公司',
    address: '上海市徐汇区淮海路',
    phone: '021-87654321',
    email: 'shanghai@example.com',
    hasChildren: true
  },
  {
    id: 5,
    name: '南京子公司',
    parentId: 2,
    parentName: '华东分公司',
    address: '南京市玄武区中山路',
    phone: '025-12345678',
    email: 'nanjing@example.com',
    hasChildren: false
  },
  {
    id: 6,
    name: '杭州子公司',
    parentId: 2,
    parentName: '华东分公司',
    address: '杭州市西湖区钱江路',
    phone: '0571-12345678',
    email: 'hangzhou@example.com',
    hasChildren: false
  },
  {
    id: 7,
    name: '北京子公司',
    parentId: 3,
    parentName: '华北分公司',
    address: '北京市东城区王府井',
    phone: '010-23456789',
    email: 'beijing@example.com',
    hasChildren: false
  },
  {
    id: 8,
    name: '天津子公司',
    parentId: 3,
    parentName: '华北分公司',
    address: '天津市和平区南京路',
    phone: '022-12345678',
    email: 'tianjin@example.com',
    hasChildren: false
  },
  {
    id: 9,
    name: '浦东办事处',
    parentId: 4,
    parentName: '上海子公司',
    address: '上海市浦东新区张江高科技园区',
    phone: '021-23456789',
    email: 'pudong@example.com',
    hasChildren: false
  },
  {
    id: 10,
    name: '徐汇办事处',
    parentId: 4,
    parentName: '上海子公司',
    address: '上海市徐汇区漕河泾开发区',
    phone: '021-34567890',
    email: 'xuhui@example.com',
    hasChildren: false
  }
];

// 状态管理
// 状态管理 - 修改为支持多选
const selectedEnterpriseIds = ref([]); // 存储多个选择的企业ID
const currentEnterprises = ref([]); // 存储多个选择的企业详情
const enterpriseTree = ref([]); // 树形结构企业数据

// 分页状态
const currentPage = ref(1);
const pageSize = ref(5);

// 分页数据计算
const pagedEnterprises = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value;
  return currentEnterprises.value.slice(startIndex, startIndex + pageSize.value);
});


// 方法：将扁平数据转换为树形结构
const buildEnterpriseTree = () => {
  const tree = [];
  const map = {};

  // 建立ID到节点的映射
  enterpriseData.forEach(item => {
    map[item.id] = { ...item, children: [] };
  });

  // 构建树形结构
  enterpriseData.forEach(item => {
    if (item.parentId === null) {
      tree.push(map[item.id]);
    } else if (map[item.parentId]) {
      map[item.parentId].children.push(map[item.id]);
    }
  });

  return tree;
};

// 方法：加载企业树形数据
const loadEnterpriseTree = () => {
  enterpriseTree.value = buildEnterpriseTree();
};

// 新增：处理标签关闭事件 - 修复引用已删除变量问题
const handleTagClose = (id) => {
  selectedEnterpriseIds.value = selectedEnterpriseIds.value.filter(itemId => itemId !== id);
};

// 新增：处理分页大小变化
const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1; // 重置为第一页
};

// 新增：处理页码变化
const handleCurrentChange = (val) => {
  currentPage.value = val;
};

// 修改：处理查询按钮点击 - 加载多个企业详情
const handleQuery = () => {
  // 调试信息，可在控制台查看选择的企业ID
  console.log('Selected enterprise IDs:', selectedEnterpriseIds.value);
  
  // 修复：确保selectedEnterpriseIds始终为数组
  const ids = Array.isArray(selectedEnterpriseIds.value) ? selectedEnterpriseIds.value : [selectedEnterpriseIds.value];
  
  if (ids.length > 0) {
    currentEnterprises.value = enterpriseData.filter(item => 
      ids.includes(item.id)
    );
    currentPage.value = 1;
    // 调试信息，可在控制台查看筛选结果
    console.log('Filtered enterprises:', currentEnterprises.value);
  } else {
    currentEnterprises.value = [];
    // 提示用户选择企业
    ElMessage({ message: '请先选择企业', type: 'warning' });
  }
};

// 修改：重置选择方法 - 确保数组类型
const resetSelection = () => {
  selectedEnterpriseIds.value = [];
  currentEnterprises.value = [];
};

// 初始化
onMounted(() => {
  loadEnterpriseTree(); // 加载树形数据
});
</script>

<style scoped>
/* 基础颜色变量定义 */
:root {
  --primary-color: #165DFF;
  --primary-light: #E8F3FF;
  --secondary-color: #6B7280;
  --success-color: #00B42A;
  --warning-color: #FF7D00;
  --danger-color: #F53F3F;
  --light-bg: #F2F3F5;
  --white: #FFFFFF;
  --text-primary: #1D2129;
  --text-secondary: #4E5969;
  --text-tertiary: #86909C;
  --border-color: #E5E6EB;
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  --radius: 8px;
}

.enterprise-management {
  width: 1200px; /* 固定宽度为1200px */
  margin: 0 auto;
  padding: 20px;
  background-color: white; /* 恢复为白色背景 */
  min-height: 100vh;
  box-shadow: 0 0 10px rgba(0,0,0,0.05); /* 保留轻微阴影增强层次感 */
}

.header {
  margin-bottom: 30px;
  text-align: center;
}

.header h1 {
  color: var(--text-primary);
  font-size: 28px;
  font-weight: 600;
  margin: 0;
}

/* 卡片样式 */
.card {
  background: var(--white);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  padding: 20px;
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: var(--shadow);
}

.search-area {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

/* 添加查询按钮样式 */
.search-area .el-button--primary {
  background-color: #409EFF; /* 恢复Element默认primary蓝色 */
  color: white; /* 确保文字为白色 */
  opacity: 1; /* 确保按钮不透明 */
  border: none; /* 移除边框 */
}

/* 自定义级联选择器样式 */
.cascader-custom .el-cascader__tags {
  flex-wrap: wrap;
  padding: 4px 8px;
}

/* 按钮样式优化 */
.btn-primary {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background-color: #0E4CD3;
  border-color: #0E4CD3;
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: var(--white);
  color: var(--text-secondary);
  border-color: var(--border-color);
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background-color: var(--light-bg);
  transform: translateY(-1px);
}

.enterprise-detail {
  margin-bottom: 30px;
}

.enterprise-detail h2 {
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}

/* 表格样式优化 */
.custom-table .el-table__header th {
  background-color: var(--light-bg);
  color: var(--text-secondary);
  font-weight: 500;
}

.custom-table .el-table__body tr:hover > td {
  background-color: var(--primary-light) !important;
}

.custom-table .el-table__body tr {
  transition: background-color 0.2s ease;
}

/* 分页样式 */
.pagination {
  margin-top: 20px;
  text-align: right;
}

/* 标签样式优化 */
.selected-enterprises .el-tag {
  background-color: var(--primary-light);
  color: var(--primary-color);
  border-color: transparent;
  transition: all 0.2s ease;
}

.selected-enterprises .el-tag:hover {
  background-color: #CCE0FF;
  transform: translateY(-1px);
}

.selected-enterprises .el-tag .el-tag__close {
  color: var(--primary-color);
  opacity: 0.7;
}

.selected-enterprises .el-tag .el-tag__close:hover {
  opacity: 1;
}

.no-selection {
  margin-top: 40px;
  text-align: center;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .search-area {
    flex-direction: column;
    align-items: stretch;
  }

  .search-area .el-cascader {
    width: 100% !important;
    margin-right: 0 !important;
    margin-bottom: 10px;
  }

  .search-area .el-button {
    width: 100%;
    margin-right: 0 !important;
    margin-bottom: 10px;
  }
}
</style>
