<template>
  <div class="container">
    <div class="app-container">
      <el-row>
        <el-col :span="24">
          <!-- 搜索表单 -->
          <el-form :inline="true">
            <el-form-item label="产品ID">
              <el-input v-model="pageParams.productId" placeholder="产品ID" />
            </el-form-item>
            <el-form-item label="产品名称">
              <el-input v-model="pageParams.productName" placeholder="产品名称" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="getProductList">查询</el-button>
              <el-button type="info" @click="clear">清空</el-button>
              <el-button type="primary" style="margin-right:20px" @click="showAddDialog">+ 新增产品</el-button>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <br>

      <el-table :data="list" border>
        <el-table-column align="center" prop="productId" label="产品ID" width="140" />
        <el-table-column align="center" prop="productName" label="产品名称" width="200" />
        <el-table-column align="center" label="操作">
          <template v-slot="{ row }">
            <el-button type="primary" size="mini" @click="showDetail(row.productId)">详情</el-button>
            <el-button type="warning" size="mini" @click="showEditDialog(row.productId)">编辑</el-button>
            <el-popconfirm
              title="确定删除吗"
              @confirm="deleteProduct(row.productId)">
              <el-button slot="reference" style="margin-left:10px" type="danger" size="mini">删除</el-button>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <el-row type="flex" style="height:60px" align="middle" justify="end">
        <el-pagination
          :page-size="pageParams.pageSize"
          :current-page="pageParams.pageNum"
          :total="pageParams.total"
          layout="prev, pager, next"
          @current-change="changePage"
        />
      </el-row>

    </div>

    <!-- 产品详情对话框 -->
    <el-dialog title="产品详情" :visible.sync="detailVisible" width="70%">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="产品ID">{{ productDetail.productId }}</el-descriptions-item>
        <el-descriptions-item label="产品名称">{{ productDetail.productName }}</el-descriptions-item>
      </el-descriptions>
      
      <div style="margin-top: 20px;">
        <h3>任务列表</h3>
        <el-table :data="productDetail.tasks || []" border>
          <el-table-column align="center" prop="taskId" label="任务ID" width="120" />
          <el-table-column align="center" prop="taskName" label="任务名称" width="180" />
          <el-table-column align="center" prop="duration" label="持续时间(小时)" width="150" />
          <el-table-column align="center" label="所需设备">
            <template v-slot="{ row }">
              <div v-for="(item, index) in row.equipment" :key="index">
                {{ item.equipmentName }} ({{ item.quantityNeeded }}个)
              </div>
              <div v-if="!row.equipment || row.equipment.length === 0">
                无设备需求
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <!-- 添加产品对话框 -->
    <el-dialog title="新增产品" :visible.sync="addVisible" width="80%" @close="resetForm">
      <el-form ref="productForm" :model="productForm" :rules="productRules" label-width="100px">
        <h3>产品信息</h3>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="产品ID" prop="productInfo.productId">
              <el-input v-model.number="productForm.productInfo.productId" type="number" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="产品名称" prop="productInfo.productName">
              <el-input v-model="productForm.productInfo.productName" />
            </el-form-item>
          </el-col>
        </el-row>

        <h3>任务信息</h3>
        <div v-for="(task, taskIndex) in productForm.tasks" :key="taskIndex" class="task-item">
          <el-divider content-position="left">任务 {{ taskIndex + 1 }}</el-divider>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item :label="'任务ID'" :prop="'tasks.' + taskIndex + '.taskId'" :rules="taskRules.taskId">
                <el-input v-model.number="task.taskId" type="number" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item :label="'任务名称'" :prop="'tasks.' + taskIndex + '.taskName'" :rules="taskRules.taskName">
                <el-input v-model="task.taskName" />
              </el-form-item>
            </el-col>
            <el-col :span="7">
              <el-form-item :label="'持续时间'" :prop="'tasks.' + taskIndex + '.duration'" :rules="taskRules.duration">
                <el-input v-model.number="task.duration" type="number" />
              </el-form-item>
            </el-col>
            <el-col :span="1" style="display: flex; align-items: center; justify-content: flex-end;">
              <el-button type="danger" icon="el-icon-delete" circle size="mini" @click="removeTask(taskIndex)" />
            </el-col>
          </el-row>

          <h4>设备需求</h4>
          <div v-for="(equipment, equipIndex) in task.equipment" :key="equipIndex" class="equipment-item">
            <el-row :gutter="20">
              <el-col :span="11">
                <el-form-item 
                  :label="'设备ID'" 
                  :prop="'tasks.' + taskIndex + '.equipment.' + equipIndex + '.equipmentId'" 
                  :rules="equipmentRules.equipmentId">
                  <el-input v-model.number="equipment.equipmentId" type="number" />
                </el-form-item>
              </el-col>
              <el-col :span="11">
                <el-form-item 
                  :label="'需求数量'" 
                  :prop="'tasks.' + taskIndex + '.equipment.' + equipIndex + '.quantityNeeded'" 
                  :rules="equipmentRules.quantityNeeded">
                  <el-input v-model.number="equipment.quantityNeeded" type="number" />
                </el-form-item>
              </el-col>
              <el-col :span="2" style="display: flex; align-items: center; justify-content: flex-end;">
                <el-button type="danger" icon="el-icon-delete" circle size="mini" @click="removeEquipment(taskIndex, equipIndex)" />
              </el-col>
            </el-row>
          </div>
          <el-button type="success" icon="el-icon-plus" size="small" @click="addEquipment(taskIndex)">添加设备</el-button>
        </div>
        <div style="margin-top: 15px;">
          <el-button type="primary" @click="addTask">添加任务</el-button>
        </div>

        <el-form-item style="margin-top: 30px; text-align: center;">
          <el-button type="primary" @click="submitForm">提交</el-button>
          <el-button @click="addVisible = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 编辑产品对话框 -->
    <el-dialog title="编辑产品" :visible.sync="editVisible" width="80%" @close="resetForm">
      <el-form ref="editForm" :model="productForm" :rules="productRules" label-width="100px">
        <!-- 与添加对话框相同的表单内容，但ID可能不可修改 -->
        <h3>产品信息</h3>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="产品ID" prop="productInfo.productId">
              <el-input v-model.number="productForm.productId" type="number" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="产品名称" prop="productInfo.productName">
              <el-input v-model="productForm.productName" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 任务部分与添加对话框类似，但需标记现有任务 -->
        <h3>任务信息</h3>
        <div v-for="(task, taskIndex) in productForm.tasks" :key="taskIndex" class="task-item">
          <el-divider content-position="left">任务 {{ taskIndex + 1 }} 
            <span v-if="task.isExisting">(现有任务)</span>
          </el-divider>
          <!-- 任务表单内容同添加对话框 -->
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item :label="'任务ID'" :prop="'tasks.' + taskIndex + '.taskId'" :rules="taskRules.taskId">
                <el-input v-model.number="task.taskId" type="number" :disabled="task.isExisting" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item :label="'任务名称'" :prop="'tasks.' + taskIndex + '.taskName'" :rules="taskRules.taskName">
                <el-input v-model="task.taskName" />
              </el-form-item>
            </el-col>
            <el-col :span="7">
              <el-form-item :label="'持续时间'" :prop="'tasks.' + taskIndex + '.duration'" :rules="taskRules.duration">
                <el-input v-model.number="task.duration" type="number" />
              </el-form-item>
            </el-col>
            <el-col :span="1" style="display: flex; align-items: center; justify-content: flex-end;">
              <el-button type="danger" icon="el-icon-delete" circle size="mini" @click="removeTask(taskIndex)" />
            </el-col>
          </el-row>

          <!-- 设备部分同添加对话框 -->
          <h4>设备需求</h4>
          <div v-for="(equipment, equipIndex) in task.equipment" :key="equipIndex" class="equipment-item">
            <el-row :gutter="20">
              <el-col :span="11">
                <el-form-item 
                  :label="'设备ID'" 
                  :prop="'tasks.' + taskIndex + '.equipment.' + equipIndex + '.equipmentId'" 
                  :rules="equipmentRules.equipmentId">
                  <el-input v-model.number="equipment.equipmentId" type="number" />
                </el-form-item>
              </el-col>
              <el-col :span="11">
                <el-form-item 
                  :label="'需求数量'" 
                  :prop="'tasks.' + taskIndex + '.equipment.' + equipIndex + '.quantityNeeded'" 
                  :rules="equipmentRules.quantityNeeded">
                  <el-input v-model.number="equipment.quantityNeeded" type="number" />
                </el-form-item>
              </el-col>
              <el-col :span="2" style="display: flex; align-items: center; justify-content: flex-end;">
                <el-button type="danger" icon="el-icon-delete" circle size="mini" @click="removeEquipment(taskIndex, equipIndex)" />
              </el-col>
            </el-row>
          </div>
          <el-button type="success" icon="el-icon-plus" size="small" @click="addEquipment(taskIndex)">添加设备</el-button>
        </div>
        <div style="margin-top: 15px;">
          <el-button type="primary" @click="addTask">添加任务</el-button>
        </div>

        <el-form-item style="margin-top: 30px; text-align: center;">
          <el-button type="primary" @click="updateForm">更新</el-button>
          <el-button @click="editVisible = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { getProductList, getProductDetail, addProduct, updateProduct, deleteProduct } from '@/api/product'

export default {
  name: 'Product',
  data() {
    return {
      list: [],
      pageParams: {
        pageNum: 1,
        pageSize: 10,
        total: 0,
        productId: '',
        productName: ''
      },
      detailVisible: false,
      addVisible: false,
      editVisible: false,
      productDetail: {},
      productForm: {
        productId: '',
        productName: '',
        productInfo: {
          productId: '',
          productName: ''
        },
        tasks: []
      },
      productRules: {
        'productInfo.productId': [
          { required: true, message: '产品ID不能为空', trigger: 'blur' },
          { type: 'number', message: '产品ID必须为数字', trigger: 'blur' }
        ],
        'productInfo.productName': [
          { required: true, message: '产品名称不能为空', trigger: 'blur' }
        ]
      },
      taskRules: {
        taskId: [
          { required: true, message: '任务ID不能为空', trigger: 'blur' },
          { type: 'number', message: '任务ID必须为数字', trigger: 'blur' }
        ],
        taskName: [
          { required: true, message: '任务名称不能为空', trigger: 'blur' }
        ],
        duration: [
          { required: true, message: '持续时间不能为空', trigger: 'blur' },
          { type: 'number', message: '持续时间必须为数字', trigger: 'blur' }
        ]
      },
      equipmentRules: {
        equipmentId: [
          { required: true, message: '设备ID不能为空', trigger: 'blur' },
          { type: 'number', message: '设备ID必须为数字', trigger: 'blur' }
        ],
        quantityNeeded: [
          { required: true, message: '需求数量不能为空', trigger: 'blur' },
          { type: 'number', message: '需求数量必须为数字', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getProductList()
  },
  methods: {
    // 获取产品列表
    async getProductList() {
      try {
        const { data } = await getProductList(this.pageParams)
        const { rows, total } = data
        this.list = rows
        this.pageParams.total = total
      } catch (error) {
        console.error('获取产品列表失败:', error)
        this.$message.error('获取产品列表失败')
      }
    },
    
    // 切换分页
    changePage(newPage) {
      this.pageParams.pageNum = newPage
      this.getProductList()
    },
    
    // 清空搜索条件
    clear() {
      this.pageParams.productId = ''
      this.pageParams.productName = ''
      this.getProductList()
    },
    // 显示产品详情
    async showDetail(productId) {
      try {
        const { data } = await getProductDetail(productId)
        this.productDetail = data
        this.detailVisible = true
      } catch (error) {
        console.error('获取产品详情失败:', error)
        this.$message.error('获取产品详情失败')
      }
    },
    // 显示添加产品对话框
    showAddDialog() {
      this.resetForm()
      this.addTask() // 添加一个空任务行
      this.addVisible = true
    },
    // 显示编辑产品对话框
    async showEditDialog(productId) {
      try {
        const { data } = await getProductDetail(productId)
        
        // 初始化表单
        this.productForm = {
          productId: data.productId,
          productName: data.productName,
          tasks: data.tasks ? data.tasks.map(task => {
            return {
              taskId: task.taskId,
              taskName: task.taskName,
              duration: task.duration,
              isExisting: true,
              equipment: task.equipment ? task.equipment.map(equip => {
                return {
                  equipmentId: equip.equipmentId,
                  quantityNeeded: equip.quantityNeeded
                }
              }) : []
            }
          }) : []
        }
        
        this.editVisible = true
      } catch (error) {
        console.error('获取产品详情失败:', error)
        this.$message.error('获取产品详情失败')
      }
    },
    // 添加一个空任务
    addTask() {
      this.productForm.tasks.push({
        taskId: '',
        taskName: '',
        duration: '',
        equipment: []
      })
    },
  // 删除任务
  removeTask(index) {
      this.productForm.tasks.splice(index, 1)
    },
    
    // 添加设备到任务
    addEquipment(taskIndex) {
      this.productForm.tasks[taskIndex].equipment.push({
        equipmentId: '',
        quantityNeeded: ''
      })
    },
    
    // 删除设备
    removeEquipment(taskIndex, equipIndex) {
      this.productForm.tasks[taskIndex].equipment.splice(equipIndex, 1)
    },
    
    // 重置表单
    resetForm() {
      this.productForm = {
        productId: '',
        productName: '',
        productInfo: {
          productId: '',
          productName: ''
        },
        tasks: []
      }
      
      if (this.$refs.productForm) {
        this.$refs.productForm.resetFields()
      }
      
      if (this.$refs.editForm) {
        this.$refs.editForm.resetFields()
      }
    },
    
    // 提交添加表单
    submitForm() {
      this.$refs.productForm.validate(async valid => {
        if (valid) {
          try {
            // 准备提交的数据
            const submitData = {
              productInfo: this.productForm.productInfo,
              tasks: this.productForm.tasks.map(task => {
                return {
                  taskId: task.taskId,
                  taskName: task.taskName,
                  duration: task.duration,
                  equipment: task.equipment
                }
              })
            }
            
            await addProduct(submitData)
            this.$message.success('添加产品成功')
            this.addVisible = false
            this.getProductList()
          } catch (error) {
            console.error('添加产品失败:', error)
            this.$message.error('添加产品失败: ' + (error.message || '未知错误'))
          }
        } else {
          this.$message.warning('请完善表单信息')
          return false
        }
      })
    },
    
    // 提交更新表单
    updateForm() {
      this.$refs.editForm.validate(async valid => {
        if (valid) {
          try {
            // 准备提交的数据
            const submitData = {
              productId: this.productForm.productId,
              productName: this.productForm.productName,
              tasks: this.productForm.tasks.map(task => {
                return {
                  taskId: task.taskId,
                  taskName: task.taskName,
                  duration: task.duration,
                  isExisting: task.isExisting || false,
                  equipment: task.equipment
                }
              })
            }
            
            await updateProduct(submitData)
            this.$message.success('更新产品成功')
            this.editVisible = false
            this.getProductList()
          } catch (error) {
            console.error('更新产品失败:', error)
            this.$message.error('更新产品失败: ' + (error.message || '未知错误'))
          }
        } else {
          this.$message.warning('请完善表单信息')
          return false
        }
      })
    },
    
    // 删除产品
    async deleteProduct(productId) {
      try {
        await deleteProduct(productId)
        this.$message.success('删除产品成功')
        
        // 如果当前页只有一条数据，删除后跳转到上一页
        if (this.list.length === 1 && this.pageParams.pageNum > 1) {
          this.pageParams.pageNum--
        }
        
        this.getProductList()
      } catch (error) {
        console.error('删除产品失败:', error)
        this.$message.error('删除产品失败')
      }
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.task-item {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background-color: #f9fafc;
}

.equipment-item {
  margin-bottom: 15px;
  padding: 10px;
  border: 1px dashed #e0e0e0;
  border-radius: 4px;
  background-color: #fff;
}

h3, h4 {
  margin-top: 15px;
  margin-bottom: 15px;
  color: #606266;
}
</style>