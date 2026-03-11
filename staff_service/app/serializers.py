from rest_framework import serializers
from .models import StaffMember


class StaffMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = StaffMember
        fields = '__all__'
