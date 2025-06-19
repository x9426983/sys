<template>
  <div class="app-container">
    <!-- 搜索栏 -->
    <div class="filter-container">
      <el-input
        v-model="searchForm.equipmentId"
        placeholder="设备ID"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-input
        v-model="searchForm.equipmentName"
        placeholder="设备名称"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-plus" @click="handleCreate">
        添加设备
      </el-button>
    </div>

    <!-- 数据表格 -->
    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="设备ID" prop="equipmentId" align="center" width="100" />
      <el-table-column label="设备名称" prop="equipmentName" align="center" width="150" />
      <el-table-column label="设备数量" prop="equipmentNumber" align="center" width="100" />
      <el-table-column label="剩余数量" prop="equipmentRestNumber" align="center" width="100" />
      <el-table-column label="操作" align="center" width="230">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button type="danger" size="mini" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.pagesize"
      @pagination="getList"
    />

    <!-- 添加/编辑对话框 -->
    <el-dialog :title="dialogStatus === 'create' ? '添加设备' : '编辑设备'" :visible.sync="dialogVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="100px"
      >
        <el-form-item label="设备ID" prop="equipmentId">
          <el-input v-model="temp.equipmentId" :disabled="dialogStatus === 'update'" />
        </el-form-item>
        <el-form-item label="设备名称" prop="equipmentName">
          <el-input v-model="temp.equipmentName" />
        </el-form-item>
        <el-form-item label="设备数量" prop="equipmentNumber">
          <el-input-number v-model="temp.equipmentNumber" :min="0" />
        </el-form-item>
        <el-form-item label="剩余数量" prop="equipmentRestNumber">
          <el-input-number v-model="temp.equipmentRestNumber" :min="0" :max="temp.equipmentNumber" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getEquipmentList, addEquipment, updateEquipment, deleteEquipment } from '@/api/equipment'
import Pagination from '@/components/Pagination'

export default {
  name: 'Equipment',
  components: { Pagination },
  data() {
    return {
      list: [],
      total: 0,
      listLoading: false,
      listQuery: {
        page: 1,
        pagesize: 10,
        equipmentId: undefined,
        equipmentName: undefined
      },
      searchForm: {
        equipmentId: '',
        equipmentName: ''
      },
      temp: {
        equipmentId: '',
        equipmentName: '',
        equipmentNumber: 0,
        equipmentRestNumber: 0
      },
      dialogVisible: false,
      dialogStatus: '',
      rules: {
        equipmentId: [{ required: true, message: '设备ID不能为空', trigger: 'blur' }],
        equipmentName: [{ required: true, message: '设备名称不能为空', trigger: 'blur' }],
        equipmentNumber: [{ required: true, message: '设备数量不能为空', trigger: 'blur' }],
        equipmentRestNumber: [{ required: true, message: '剩余数量不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    async getList() {
      this.listLoading = true
      try {
        const { data } = await getEquipmentList(this.listQuery)
        this.list = data.items
        this.total = data.total
      } catch (error) {
        console.error('获取设备列表失败:', error)
      }
      this.listLoading = false
    },
    handleFilter() {
      this.listQuery.page = 1
      this.listQuery.equipmentId = this.searchForm.equipmentId
      this.listQuery.equipmentName = this.searchForm.equipmentName
      this.getList()
    },
    resetTemp() {
      this.temp = {
        equipmentId: '',
        equipmentName: '',
        equipmentNumber: 0,
        equipmentRestNumber: 0
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    async createData() {
      this.$refs['dataForm'].validate(async (valid) => {
        if (valid) {
          try {
            await addEquipment(this.temp)
            this.dialogVisible = false
            this.$message({
              type: 'success',
              message: '创建成功'
            })
            this.getList()
          } catch (error) {
            console.error('创建设备失败:', error)
          }
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row)
      this.dialogStatus = 'update'
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    async updateData() {
      this.$refs['dataForm'].validate(async (valid) => {
        if (valid) {
          try {
            await updateEquipment(this.temp)
            this.dialogVisible = false
            this.$message({
              type: 'success',
              message: '更新成功'
            })
            this.getList()
          } catch (error) {
            console.error('更新设备失败:', error)
          }
        }
      })
    },
    async handleDelete(row) {
      try {
        await this.$confirm('确认删除该设备吗？')
        await deleteEquipment(row.equipmentId)
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
        this.getList()
      } catch (error) {
        console.error('删除设备失败:', error)
      }
    }
  }
}
</script>

<style scoped>
.filter-container {
  padding-bottom: 10px;
}
.filter-item {
  margin-right: 10px;
}
</style>