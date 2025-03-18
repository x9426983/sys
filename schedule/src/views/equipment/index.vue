<template>
  <div class="container">
    <div class="app-container">
      <el-row>
        <el-col :span="24">
          <!-- 搜索表单 -->
          <el-form :inline="true">
            <el-form-item label="设备ID">
              <el-input v-model="pageParams.equipmentId" placeholder="设备ID" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="changeValue">查询</el-button>
              <el-button type="info" @click="clear">清空</el-button>
              <el-button type="primary" style="margin-right:20px" @click="showDialog = true">+ 新增设备</el-button>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <br>

      <el-table :data="list" border>
        <el-table-column align="center" prop="equipmentId" label="设备ID" width="140">
          <template v-slot=" {row} ">
            <el-input v-if="row.isEdit" v-model="row.editRow.equipmentId" size="mini" />
            <span v-else>{{ row.equipmentId }}</span>
          </template>
        </el-table-column>


        <el-table-column align="center" prop="equipmentName" label="设备名称" width="140">
          <template v-slot=" {row} ">
            <el-input v-if="row.isEdit" v-model="row.editRow.equipmentName" size="mini" />
            <span v-else>{{ row.equipmentName }}</span>
          </template>
        </el-table-column> 
        
        <el-table-column align="center" prop="equipmentNumber" label="设备数量" width="140">
          <template v-slot=" {row} ">
            <el-input v-if="row.isEdit" v-model="row.editRow.equipmentNumber" size="mini" />
            <span v-else>{{ row.equipmentNumber }}</span>
          </template>
        </el-table-column> 

        <el-table-column align="center" prop="equipmentRestNumber" label="设备剩余数量" width="140">
          <template v-slot=" {row} ">
            <el-input v-if="row.isEdit" v-model="row.editRow.equipmentRestNumber" size="mini" />
            <span v-else>{{ row.equipmentRestNumber }}</span>
          </template>
        </el-table-column> 

        <el-table-column align="center" label="操作">
          <template v-slot="{ row }">
            <el-button type="primary" size="mini" @click="btnEdit(row)">编辑</el-button>
            <el-popconfirm
              title="确定删除吗"
              @onConfirm="confirmDel(row.orderId)">
              <el-button slot="reference" style="margin-left:10px" type="danger" size="mini" @click="btnDelete(row.equipmentId)">删除</el-button>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>


      <el-row type="flex" style="height:60px" align="middle" justify="end">
        <el-pagination
          :page-size="pageParams.pagesize"
          :current-page="pageParams.page"
          :total="pageParams.total"
          layout="prev, pager, next"
          @current-change="changePage"
        />
      </el-row>

    </div>
    <el-dialog title="新增设备" :visible.sync="showDialog" width="500px" @close="btnCancel">
      <el-form ref="addform" :model="addform" :rules="rules" label-width="120px">
        <el-form-item prop="equipmentId" label="设备ID">
          <el-input v-model="addform.equipmentId" style="width:300px" size="mini" />
        </el-form-item>

        <el-form-item prop="equipmentName" label="设备名称">
          <el-input v-model="addform.equipmentName" style="width:300px" size="mini" />
        </el-form-item>
        
        <el-form-item prop="equipmentNumber" label="设备数量">
          <el-input v-model="addform.equipmentNumber" style="width:300px" size="mini" />
        </el-form-item>

        <el-form-item prop="equipmentRestNumber" label="设备剩余数量">
          <el-input v-model="addform.equipmentRestNumber" style="width:300px" size="mini" />
        </el-form-item>

        <el-form-item>
          <el-row type="flex" justify="center">
            <el-col :span="18">
              <el-button type="primary" @click="btnOK">提交</el-button>
              <el-button @click="btnCancel">取消</el-button>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
    </el-dialog>

    <el-dialog title="编辑设备" :visible.sync="showUpdateDialog" width="500px" @close="btnCancel">
      <el-form ref="UpdateForm" :model="UpdateForm" :rules="rules" label-width="120px">
        <!-- 表单内容 -->
        <el-form-item prop="equipmentId" label="设备ID">
          <el-input v-model="UpdateForm.equipmentId" style="width:300px" size="mini" />
        </el-form-item>

        <el-form-item prop="equipmentName" label="设备名称">
          <el-input v-model="UpdateForm.equipmentName" style="width:300px" size="mini" />
        </el-form-item>
        
        <el-form-item prop="equipmentNumber" label="设备数量">
          <el-input v-model="UpdateForm.equipmentNumber" style="width:300px" size="mini" />
        </el-form-item>

        <el-form-item prop="equipmentRestNumber" label="设备剩余数量">
          <el-input v-model="UpdateForm.equipmentRestNumber" style="width:300px" size="mini" />
        </el-form-item>

        <!-- 表单提交按钮 -->
        <el-form-item>
          <el-row type="flex" justify="center">
            <el-col :span="18">
              <el-button type="primary" @click="updatebtnOK">确定</el-button>
              <el-button @click="updatebtnCancel">取消</el-button>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
    </el-dialog>

  </div>
</template>

<script>
import { getEquipmentList, addEquipment, updateEquipment, deleteEquipment } from '@/api/equipment'
export default {
  name: 'Equipment',
  data() {
    return {
      list: [],
      showDialog: false,
      showUpdateDialog:false,
      // 将分页信息放置到一个对象中
      pageParams: {
        page: 1,
        pagesize: 10,
        total: 0,
        equipmentId: ''
      },
      addform: {
        equipmentId: '',
        equipmentNumber: '',
        equipmentRestNumber: '',
        equipmentName: null
      },
      UpdateForm: {
        equipmentId: '',
        equipmentNumber: '',
        equipmentRestNumber: '',
        equipmentName: null
      },
      rules: {
        equipmentId: [{ required: true, message: '设备ID不能为空', trigger: 'blur' }],
        equipmentNumber: [{ required: true, message: '设备数量不能为空', trigger: 'blur' }],
        equipmentRestNumber: [{ required: true, message: '设备剩余数量不能为空', trigger: 'blur' }],
        equipmentName: [{ required: true, message: '设备名称不能为空', trigger: 'blur' }]
      }
    };
  },
  created() {
    this.getEquipmentList()
  },
  methods: {
    async btnEdit(row) {
       alert(row.equipmentName)
      // 当点击编辑按钮时执行
      // 使用数据行来填充编辑表单
      //this.orderForm = { ...row };
      this.UpdateForm.equipmentId = row.equipmentId;
      this.UpdateForm.equipmentNumber = row.equipmentNumber;
      this.UpdateForm.equipmentName = row.equipmentName;
      this.UpdateForm.equipmentRestNumber = row.equipmentRestNumber;
      this.showUpdateDialog = true; // 显示编辑对话框
    },
    async btnDelete(equipmentId){
      await deleteEquipment(equipmentId)
      this.$message.success('删除订单成功')
      if (this.list.length === 1) this.pageParams.page--
      this.getEquipmentList()
    },
    updatebtnOK() {
      this.$refs.UpdateForm.validate(isOK => {
        if (isOK) {
          updateEquipment(this.UpdateForm)
          this.getEquipmentList()
          this.showUpdateDialog = false
        }
      });
    },
    updatebtnCancel() {
      // 取消编辑
      this.showUpdateDialog = false; // 隐藏对话框
    },
    async getEquipmentList() {
      const{data} = await getEquipmentList(this.pageParams)
      const { rows, total } = data
      this.list = rows
      this.pageParams.total = total
      this.list.forEach(item => {
        this.$set(item, 'editRow', {
          equipmentId: item.equipmentId,
          equipmentNumber: item.equipmentNumber,
          equipmentName: item.equipmentName,
          equipmentRestNumber: item.equipmentRestNumber,
        })
      })
    },
    // 切换分页时 请求新的数据
    changePage(newPage) {
      this.pageParams.page = newPage
      this.getEquipmentList()
    },
    btnOK() {
      this.$refs.addform.validate(isOK => {
        if (isOK) {
          addEquipment(this.addform)
          this.$message.success('新增订单成功')
          this.getEquipmentList()
        }
      })
    },
    btnCancel() {
      this.$refs.addform.resetFields()
      this.showDialog = false
    },
    async btnEditOK(row) {
      if (row.editRow.equipmentId && row.editRow.equipmentNumber && row.editRow.equipmentRestNumber && row.editRow.equipmentName) {
        await updateOrder(row.editRow)
        this.$message.success('更新设备成功')
        Object.assign(row, {
          ...row.editRow,
          isEdit: false
        })
      } else {
        this.$message.warning('数据不能为空')
      }
    },
    clear() {
      this.pageParams.equipmentId = null
      this.pageParams.equipmentNumber = null
      this.getEquipmentList()
    }
  }
}
</script>
@/api/equipment