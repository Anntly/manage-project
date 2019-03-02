<template>
  <section class="app-container">
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" @submit.native.prevent>
        <el-dropdown>
          <el-button type="primary">
            选择店铺
            <i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <template v-for="item in restaurants">
              <el-dropdown-item
                :key="item.id"
                @click.native="selectResturant(item.id)"
              >{{item.name}}</el-dropdown-item>
            </template>
          </el-dropdown-menu>
        </el-dropdown>
        <el-form-item>
          <el-input v-model="filters.id" placeholder="ID"></el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="filters.name" placeholder="员工名称"></el-input>
        </el-form-item>
        <el-form-item>
          <el-select v-model="filters.status" placeholder="请选择员工状态">
            <el-option label="离职" value="3"></el-option>
            <el-option label="在职" value="1"></el-option>
            <el-option label="休假" value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-on:click="getEmployee">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleAdd">新增</el-button>
        </el-form-item>
        <!-- <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button> -->
      </el-form>
    </el-col>
    <!-- <el-button type="success" round @click="handleBack()">返回</el-button> -->
    <!--列表-->
    <el-table
      :data="employee"
      :default-sort="{prop: 'id', order: 'descending'}"
      @sort-change="handleSortChange"
      stripe
      highlight-current-row
      @selection-change="selsChange"
      style="min-width: 100%;"
      v-loading="loading"
    >
      <el-table-column sortable="custom" prop="id" label="ID"></el-table-column>
      <el-table-column prop="name" label="员工"></el-table-column>
      <el-table-column prop="position" label="员工职称"></el-table-column>
      <el-table-column prop="idCardNumber" label="身份证号"></el-table-column>
      <el-table-column prop="sex" label="性别" 
      :formatter="sexFormatter"
      :filters="[{ text: '女', value: false },{ text: '男', value: true }]"
      :filter-method="filterSex"
      >
      </el-table-column>
      <el-table-column sortable="custom" prop="age" label="年龄"></el-table-column>
      <el-table-column prop="birthday" label="生日"></el-table-column>
      <el-table-column prop="phone" label="联系电话"></el-table-column>
      <el-table-column prop="salary" label="薪资"></el-table-column>
      <el-table-column prop="status" label="状态"
      :filters="[{ text: '在职', value: 1 },{ text: '休假', value: 2 },{ text: '离职', value: 3 }]"
      :filter-method="filterStatus"
       >
        <template slot-scope="scope">
        <el-tag
          :type="statusCheck(scope.row.status)"
          disable-transitions v-html="statusFormatter(scope,scope.row.status)"></el-tag>
      </template>
      </el-table-column>
      <el-table-column sortable="custom" prop="create_time" label="入职时间" width="120"></el-table-column>
      <el-table-column sortable="custom" prop="expire_time" label="合同时间" width="120"></el-table-column>
      <el-table-column sortable="custom" prop="update_time" label="更新时间" width="120"></el-table-column>
      <el-table-column label="操作" width="100">
        <template slot-scope="scope">
          <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <!-- <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button> -->
        </template>
      </el-table-column>
    </el-table>

    <!--工具条-->
    <el-col :span="24" class="toolbar">
      <el-pagination
        layout="total,prev, pager, next, jumper"
        @current-change="handleCurrentChange"
        :total="this.total"
        :page-size="10"
        style="float:right;"
      ></el-pagination>
    </el-col>

    <!--编辑界面-->
    <el-dialog
      :title="textMap[dialogStatus]"
      :visible.sync="dialogFormVisible"
      :close-on-click-modal="false"
    >
      <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
        <el-form-item v-if="false" label="ID" prop="id">
          <el-input v-model="editForm.id" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item v-if="false" label="RestaurantId" prop="restaurantId">
          <el-input v-model="editForm.restaurantId" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="员工名称" prop="name">
          <el-input v-model="editForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="员工职位" prop="position">
          <el-input v-model="editForm.position" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="身份证号" prop="idCardNumber">
          <el-input v-model="editForm.idCardNumber" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="editForm.phone" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-switch active-text="男" inactive-text="女" v-model="editForm.sex"></el-switch>
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <el-input v-model="editForm.age" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="生日" prop="birthday">
          <el-date-picker
            type="date"
            placeholder="选择日期"
            v-model="editForm.birthday"
            style="width: 100%;"
            @change="dateChangebirthday"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="薪资" prop="salary">
          <el-input-number v-model="editForm.salary" :step="100" :precision="2" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item v-if="dialogStatus === 'update'" label="状态" prop="status">
          <el-select v-model="editForm.status" placeholder="请选择员工状态">
            <el-option label="离职" value="3"></el-option>
            <el-option label="在职" value="1"></el-option>
            <el-option label="休假" value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="入职时间" prop="createTime">
          <el-date-picker
            type="date"
            placeholder="选择日期"
            v-model="editForm.createTime"
            @change="dateChangebirthday"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            style="width: 100%;"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="合同时间" prop="expireTime">
          <el-date-picker
            type="date"
            placeholder="选择日期"
            v-model="editForm.expireTime"
            style="width: 100%;"
            @change="dateChangebirthday"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
          ></el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="dialogFormVisible=false">取消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">添加</el-button>
        <el-button v-else type="primary" @click="updateData">修改</el-button>
      </div>
    </el-dialog>
  </section>
</template>
<script>
import {
  getRestaurantNodes,
  removeMenuFoodCat,
  batchRemoveMenuFoodCat
} from "@/api/dishMenu";
import { getEmployeeData, editEmployee, addEmployee } from "@/api/employee";
import QS from "qs";
import { Message, MessageBox } from "element-ui";

export default {
  name: "EmployeeManage",
  data() {
    return {
      restaurants: [],
      loading: true,
      options: [], // 级联选择器结果
      childrens: [], //所有的子节点
      selectedOptions: [], // 用户 edit时，回显的数据
      textMap: {
        update: "Edit",
        create: "Create"
      },
      dialogFormVisible: false,
      filters: {
        id: null,
        restaurantId: null,
        name: "",
        status: 1
      },
      key: "",
      employee: [],
      total: 0,
      totalPage: 0,
      page: 1,
      sortBy: "",
      desc: false,
      sels: [], // 列表选中列
      editFormRules: {},
      // 编辑界面数据
      editForm: {
        id: 0,
        name: "",
        restaurantId: 0,
        position: "",
        idCardNumber: "",
        sex: false,
        age: 20,
        birthday: null,
        phone: "",
        salary: "",
        createTime: "",
        expireTime: ""
      },

      addFormVisible: false, // 新增界面是否显示
      addFormRules: {},
      dialogImageUrl: "",
      dialogVisible: false,
      productImgs: [], // 文件列表
      isMultiple: true,
      imgLimit: 1, // 上传文件数量
      dialogStatus: "",
      selectedTag: {}
    };
  },
  methods: {
    filterSex(value, row) {
        return row.sex === value;
      },
    dateChangebirthday(val) {
      console.log(val);
      this.form.birthdayName = val;
    },
    getRestaurants() {
      getRestaurantNodes().then(res => (this.restaurants = res));
    },
    selectResturant(restaurantId) {
      this.filters.restaurantId = restaurantId;
      this.getEmployee();
    },
    filterStatus(value, row) {
      return row.status === value;
    },
    statusCheck(status){
      switch (status) {
        case 3:
          return "danger";
          break;
        case 1:
          return "success";
          break;
        case 2:
          return "primary";
          break;
        default:
          return "warning";
      }
    },
    statusFormatter(scope, val) {
      switch (val) {
        case 3:
          return "离职";
          break;
        case 1:
          return "在职";
          break;
        case 2:
          return "休假";
          break;
        default:
          return "未知";
      }
    },
    handleRemove(file, fileList) {
      //移除图片
      console.log(file, fileList);
    },
    handlePictureCardPreview(file) {
      //预览图片时调用
      console.log(file);
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },

    beforeAvatarUpload(file) {
      //文件上传之前调用做一些拦截限制
      console.log(file);
      const isJPG = true;
      // const isJPG = file.type === 'image/jpeg';
      const isLt2M = file.size / 1024 / 1024 < 2;

      // if (!isJPG) {
      //   this.$message.error('上传头像图片只能是 JPG 格式!');
      // }
      if (!isLt2M) {
        this.$message.error("上传图片大小不能超过 2MB!");
      }
      return isJPG && isLt2M;
    },
    handleAvatarSuccess(res, file) {
      //图片上传成功
      this.editForm.pic = res;
    },
    handleExceed(files, fileList) {
      //图片上传超过数量限制
      this.$message.error("上传图片不能超过1张!");
      console.log(file, fileList);
    },
    imgUploadError(err, file, fileList) {
      //图片上传失败调用
      console.log(err);
      this.$message.error("上传图片失败!");
    },
    // 性别显示转换
    sexFormatter: function(row, column) {
      return row.sex === true ? "男" : row.sex === false ? "女" : "未知";
    },
    handleCurrentChange(val) {
      this.page = val;
      this.getEmployee();
    },
    // 处理filters的数据
    checkObj(para) {
      para.key = JSON.stringify(this.filters);
      getEmployeeData(para)
        .then(res => {
          let restaurantId = this.filters.restaurantId;
          this.total = res.total;
          this.totalPage = res.totalPage;
          this.employee = res.items;
          this.loading = false;
          this.filters = {};
          this.filters.restaurantId = restaurantId;
        })
        .catch();
    },
    // 获取用户列表
    getEmployee() {
      const para = {
        key: this.filters,
        page: this.page,
        sortBy: this.sortBy,
        desc: this.desc
      };
      this.checkObj(para);
    },
    // 删除
    handleDel(index, row) {
      this.$confirm("确认删除该记录吗?", "提示", {
        type: "warning"
      })
        .then(() => {
          removeMenuFoodCat(row.id).then(res => {
            this.$message({
              message: "删除成功",
              type: "success"
            });
            this.getEmployee();
          });
        })
        .catch(() => {});
    },
    // 显示编辑界面
    handleEdit(index, row) {
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.editForm = Object.assign({}, row);
    },
    // 显示新增界面
    handleAdd() {
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.editForm = {
        id: 0,
        name: "",
        restaurantId: 0,
        position: "",
        idCardNumber: "",
        sex: false,
        age: 20,
        birthday: null,
        phone: "",
        salary: "",
        createTime: "",
        expireTime: ""
      };
    },
    // 编辑
    updateData() {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          this.$confirm("确认提交吗？", "提示", {})
            .then(() => {
              this.editForm.restaurantId = this.filters.restaurantId;
              const para = Object.assign({}, this.editForm);
              editEmployee(para).then(res => {
                this.$message({
                  message: "提交成功",
                  type: "success"
                });
                this.$refs["editForm"].resetFields();
                this.dialogFormVisible = false;
                this.selectedOptions = [];
                this.getEmployee();
              });
            })
            .catch(e => {
              // 打印一下错误
              console.log(e);
            });
        }
      });
    },
    // 新增
    createData: function() {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          this.$confirm("确认提交吗？", "提示", {})
            .then(() => {
              this.editForm.restaurantId = this.filters.restaurantId;
              const para = Object.assign({}, this.editForm);
              console.log(para);
              addEmployee(para).then(res => {
                this.$message({
                  message: "提交成功",
                  type: "success"
                });
                this.$refs["editForm"].resetFields();
                this.dialogFormVisible = false;
                this.getEmployee();
              });
            })
            .catch(e => {
              // 打印一下错误
              console.log(e);
            });
        }
      });
    },
    // 全选单选多选
    selsChange(sels) {
      this.sels = sels;
    },
    // 批量删除
    batchRemove() {
      var ids = this.sels.map(item => item.id).toString();
      this.$confirm("确认删除选中记录吗？", "提示", {
        type: "warning"
      })
        .then(() => {
          const para = { ids: ids };
          batchRemoveMenuFoodCat(para).then(res => {
            this.$message({
              message: "删除成功",
              type: "success"
            });
            this.getEmployee();
          });
        })
        .catch(() => {});
    },
    // 排序
    handleSortChange(column) {
      this.sortBy = column.prop;
      this.desc = column.order === "ascending";
      this.getEmployee();
    }
  },
  mounted() {
    this.getRestaurants();
    Message({
      message: "请先选择需要管理的餐厅",
      type: "warning",
      duration: 5 * 1000
    });
  }
};
</script>
<style scoped>
.el-dropdown {
  vertical-align: top;
}
.el-dropdown + .el-dropdown {
  margin-left: 15px;
}
.el-icon-arrow-down {
  font-size: 12px;
}
</style>
